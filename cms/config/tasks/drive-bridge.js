'use strict';

/**
 * Drive Bridge — polls Anna's Google Drive inbox folder every 10 minutes
 * and performs CRUD operations against Strapi based on JSON instructions.
 *
 * Why: Anna's AI assistant (Claude robots) cannot POST to our Strapi API
 * directly — her side blocks outbound HTTPS to arbitrary domains with a
 * 403 CONNECT tunnel refusal. Google Drive IS on her allowlist, so we
 * pull from a folder she owns instead of letting her robot push to us.
 *
 * Flow per tick:
 *   1. List *.json files in INBOX folder
 *   2. For each file: download, parse, dispatch on `action`
 *   3. Move file to DONE/YYYY-MM-DD/ on success, ERRORS/ on failure
 *
 * JSON shape — all actions share this top-level envelope:
 *   {
 *     "action": "create" | "update" | "unpublish" | "publish" | "export",
 *     "type":   "article" | "experience" | "page" | "product" | "vault-journey"
 *             | "programme" | "experience-page" | "practitioner"
 *             | "decoder-quiz-page",
 *     "slug":   "my-item"      // required for update/unpublish/publish on
 *                              // slug-keyed types. For "practitioner" use
 *                              // "name" instead. Single-types
 *                              // (decoder-quiz-page) need no key.
 *                              // Alternatives (rename-safe): send
 *                              // "documentId" or "id" at the top level
 *                              // and the bridge will resolve to the
 *                              // current key value.
 *     "data":   { ... }        // field map, required for create/update
 *   }
 *
 * Batch export aggregation (fix 2026-10-26): when "all": true, the
 * bridge writes ONE aggregate file (export-output.json) containing an
 * array of all entries, instead of one file per entry. This matches
 * Anna's placeholder setup (one universal placeholder = all entries).
 *
 * action defaults to "create" so old files written before the update
 * feature still work.
 *
 * Image handling: any string field can be replaced with
 *   { "from_file": "hero.jpg" }
 * which tells the bridge to look up `hero.jpg` in the IMAGES Drive
 * folder, upload to Strapi media library, and attach the returned id
 * to that field. Works at any depth inside `data`.
 *
 * Legacy `media_url` on the top level still works for backwards compat
 * with Anna's existing robot output.
 *
 * Auth: service account JSON (not an OAuth app) so there's no refresh-
 * token dance. We mint a short-lived access token from the JWT every
 * tick. No npm deps — raw crypto + fetch only.
 *
 * Env vars:
 *   DRIVE_BRIDGE_SA_JSON       Full service account JSON (one line, with \n for newlines in private_key)
 *   DRIVE_BRIDGE_INBOX_ID      Drive folder id for incoming instructions
 *   DRIVE_BRIDGE_DONE_ID       Drive folder id for completed files
 *   DRIVE_BRIDGE_ERRORS_ID     Drive folder id for failed files
 *   DRIVE_BRIDGE_IMAGES_ID     (optional) Drive folder id for images referenced by `from_file`
 *
 * Anna's Drive layout:
 *   ALW CMS Bridge/
 *     inbox/      JSON instruction files land here
 *     done/       successfully processed files
 *     errors/     failed files + sibling .error.txt
 *     images/     photos referenced via { "from_file": "name.jpg" }
 *     samples/    worked examples of each action
 *     README.md   field cheat sheet + action examples
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// ─── Google Drive auth ────────────────────────────────────────────────

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function loadServiceAccount() {
  const raw = process.env.DRIVE_BRIDGE_SA_JSON;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw);
    if (!sa.client_email || !sa.private_key) return null;
    return sa;
  } catch (err) {
    return null;
  }
}

async function mintAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(sa.private_key).toString('base64')
    .replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.access_token;
}

// ─── Drive helpers ────────────────────────────────────────────────────

async function listInboxFiles(token, inboxId) {
  // Filter by extension client-side, NOT by mimeType. Google Drive
  // sometimes stores files with mimeType "text/plain" even when
  // they're named .json (depends on how they were uploaded — drag-drop
  // sometimes sniffs content, API uploads use the type the caller
  // provides). A mimeType filter missed files Anna uploaded manually.
  // Anna 16 Oct: reset-story-you-already-know-why.json sat in inbox
  // for 7+ hours because of this. Fix: list everything, filter on
  // .json extension here.
  const q = encodeURIComponent(`'${inboxId}' in parents and trashed = false`);
  const url = `${DRIVE_API}/files?q=${q}&fields=files(id,name,mimeType)&pageSize=200`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list: ${res.status} ${await res.text()}`);
  const j = await res.json();
  const all = j.files || [];
  // Keep only .json / .JSON regardless of mimeType. Also skip our own
  // .error.txt notes if they somehow land here.
  return all.filter((f) => /\.json$/i.test(f.name) && !/\.error\.txt$/i.test(f.name));
}

async function renameFile(token, fileId, newName) {
  // Rename a Drive file in place. Used as the last-resort error channel:
  // even if we can't write a sibling .error.txt, we can always rename
  // the file to include an error marker so Anna sees WHY it failed.
  // Filenames are hard to miss; .error.txt files sometimes don't appear.
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?fields=id,name&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    },
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive rename: ${res.status} ${txt.slice(0, 200)}`);
  }
}

async function downloadFile(token, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive download: ${res.status}`);
  return res.text();
}

async function downloadBinaryFile(token, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive download: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const buf = Buffer.from(await res.arrayBuffer());
  return { buffer: buf, contentType };
}

async function listFilesInFolder(token, folderId) {
  // supportsAllDrives + includeItemsFromAllDrives cover both regular
  // user Drives (shared with the SA) and Shared Drives. Harmless on
  // either. corpora=allDrives widens the search beyond "My Drive".
  const url = `${DRIVE_API}/files?q=${encodeURIComponent(`'${folderId}' in parents and trashed = false`)}` +
    `&fields=files(id,name,mimeType,parents,owners(emailAddress))` +
    `&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list folder ${folderId}: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.files || [];
}

async function findFileByNameInFolder(token, folderId, filename) {
  // Case-insensitive + stem-matching lookup across every file the
  // service account can see in `folderId`. If the SA cannot see a file
  // the user put there (sharing / parent misconfig), this returns null
  // and the caller is responsible for giving a diagnostic error.
  const files = await listFilesInFolder(token, folderId);

  const target = String(filename).trim();
  const targetLower = target.toLowerCase();
  const targetStem = target.replace(/\.[^./\\]+$/, '').toLowerCase();

  const exact = files.find((f) => f.name === target);
  if (exact) return exact;
  const caseInsensitive = files.find((f) => f.name.toLowerCase() === targetLower);
  if (caseInsensitive) return caseInsensitive;
  const stemMatch = files.find((f) => f.name.replace(/\.[^./\\]+$/, '').toLowerCase() === targetStem);
  if (stemMatch) return stemMatch;
  return null;
}

async function moveFile(token, fileId, toParentId, fromParentId) {
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?addParents=${toParentId}&removeParents=${fromParentId}&fields=id,parents&supportsAllDrives=true`,
    { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Drive move: ${res.status} ${await res.text()}`);
}

async function uploadErrorNote(token, folderId, filename, body) {
  const metadata = {
    name: filename,
    parents: [folderId],
    mimeType: 'text/plain',
  };
  const boundary = '-----alw-boundary-' + Date.now();
  const multipart =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    `--${boundary}\r\n` +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    body + '\r\n' +
    `--${boundary}--`;
  // supportsAllDrives=true handles both regular + shared drives.
  // Harmless on non-shared drives; required for shared drives.
  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive error-note upload: ${res.status} ${txt.slice(0, 300)}`);
  }
}

// ─── Strapi helpers ───────────────────────────────────────────────────

async function uploadBufferToStrapi(strapi, buffer, filename, contentType) {
  // Strapi 5's upload service expects a Formidable-style file descriptor
  // backed by a REAL filesystem path. Earlier versions tolerated an
  // in-memory buffer, but 5.40 silently returns nothing when the file
  // has no filepath — which is why uploads looked successful but no
  // media ever appeared. Fix: write the buffer to a tmp file, pass the
  // path, delete after.
  const safeName = String(filename || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
  const tmpPath = path.join(os.tmpdir(), `drive-bridge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
  fs.writeFileSync(tmpPath, buffer);

  try {
    const uploadService = strapi.plugin('upload').service('upload');
    const uploaded = await uploadService.upload({
      data: {},
      files: {
        filepath: tmpPath,
        originalFilename: safeName,
        mimetype: contentType || 'application/octet-stream',
        size: buffer.length,
      },
    });
    const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (!first?.id) {
      throw new Error(`Strapi upload service returned no id for "${safeName}" (${buffer.length} bytes, ${contentType}). Response: ${JSON.stringify(uploaded).slice(0, 200)}`);
    }
    strapi.log.info(`[drive-bridge] uploaded "${safeName}" to media library as id=${first.id} (${buffer.length} bytes)`);
    return first.id;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}

async function uploadUrlToStrapi(strapi, mediaUrl, filename) {
  let mediaRes;
  try {
    mediaRes = await fetch(mediaUrl);
  } catch (err) {
    throw new Error(`from_url "${String(mediaUrl).slice(0, 80)}" network error: ${err.message}`);
  }
  if (!mediaRes.ok) {
    throw new Error(`from_url "${String(mediaUrl).slice(0, 80)}" returned HTTP ${mediaRes.status}. If this is a signed/temporary URL it may have expired — the bridge polls every 10 min so links need to live longer than that, or use from_file instead.`);
  }
  const buf = Buffer.from(await mediaRes.arrayBuffer());
  if (buf.length === 0) {
    throw new Error(`from_url "${String(mediaUrl).slice(0, 80)}" returned empty body`);
  }
  return uploadBufferToStrapi(
    strapi,
    buf,
    filename || mediaUrl.split('/').pop() || 'upload.bin',
    mediaRes.headers.get('content-type'),
  );
}

async function uploadDriveFileToStrapi(strapi, token, imagesFolderId, filename) {
  if (!imagesFolderId) {
    throw new Error(`from_file "${filename}" can't be resolved: DRIVE_BRIDGE_IMAGES_ID env var is not set on the server. Ask Sameer.`);
  }
  const file = await findFileByNameInFolder(token, imagesFolderId, filename);
  if (!file) {
    throw new Error(`from_file "${filename}" not found in Drive images folder. Checked exact match, case-insensitive, and extension-less. Confirm the file is in images/, spelled right, and the images folder is shared with the service account email.`);
  }
  const { buffer, contentType } = await downloadBinaryFile(token, file.id);
  if (buffer.length === 0) {
    throw new Error(`from_file "${filename}" downloaded 0 bytes from Drive`);
  }
  return uploadBufferToStrapi(strapi, buffer, file.name, contentType);
}

// ─── Media reference resolution ──────────────────────────────────────
//
// Walk the data object; wherever we find `{ from_file: 'name' }` or
// `{ from_url: 'https://...' }` as a value, resolve to a Strapi media
// id. Arrays of such references become arrays of ids. Supports nested
// objects (components) and arrays (multi-media fields).

async function resolveMediaReferences(strapi, token, imagesFolderId, value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) {
      out.push(await resolveMediaReferences(strapi, token, imagesFolderId, item));
    }
    return out;
  }
  if (typeof value === 'object') {
    if (typeof value.from_file === 'string') {
      return uploadDriveFileToStrapi(strapi, token, imagesFolderId, value.from_file);
    }
    if (typeof value.from_url === 'string') {
      return uploadUrlToStrapi(strapi, value.from_url, value.filename);
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await resolveMediaReferences(strapi, token, imagesFolderId, v);
    }
    return out;
  }
  return value;
}

// ─── Type registry ───────────────────────────────────────────────────

const TYPE_TO_UID = {
  'article': 'api::article.article',
  'experience': 'api::experience.experience',
  'page': 'api::page.page',
  'product': 'api::product.product',
  'vault-journey': 'api::vault-journey.vault-journey',
  'programme': 'api::programme.programme',
  'experience-page': 'api::experience-page.experience-page',
  'practitioner': 'api::practitioner.practitioner',
  'decoder-quiz-page': 'api::decoder-quiz-page.decoder-quiz-page',
};

const TYPE_TITLE_FIELD = {
  'article': 'title',
  'experience': 'name',
  'page': 'title',
  'product': 'name',
  'vault-journey': 'name',
  'programme': 'title',
  'experience-page': 'title',
  'practitioner': 'name',
  'decoder-quiz-page': 'title',
};

// Legacy media_url field — which attribute to attach to by default
// when the robot sends media_url at the top level instead of inside
// data via from_file. Kept for backwards compat with Anna's early robot.
const TYPE_DEFAULT_MEDIA_FIELD = {
  'article': 'hero_image',
  'experience': 'hero_image',
  'page': 'hero_image',
  'product': 'images',
  'vault-journey': 'video_thumbnail',
  'programme': 'heroImage',
  'experience-page': 'heroImage',
  'practitioner': 'portrait',
  'decoder-quiz-page': 'hero_image',
};

// Which types have draftAndPublish:true. Products do not.
const TYPE_HAS_DRAFT_PUBLISH = {
  'article': true,
  'experience': true,
  'page': true,
  'product': false,
  'vault-journey': true,
  'programme': true,
  'experience-page': true,
  'practitioner': true,
  'decoder-quiz-page': true,
};

// Which field uniquely identifies an entry for update/publish/export.
// Defaults to 'slug' when not listed. Practitioner has no slug field —
// Anna keys by full name instead (e.g. "Sarah Hughes").
const TYPE_KEY_FIELD = {
  'practitioner': 'name',
};

// Single-type content types (one row only, no slug, no filter). The
// bridge operates on them by UID alone — update/export/publish all
// target the single row directly.
const TYPE_IS_SINGLE_TYPE = {
  'decoder-quiz-page': true,
};

// ─── Schema validation ───────────────────────────────────────────────
//
// Strapi silently drops fields that don't exist on the schema. That
// means "I sent body_v2 on a Page and the page is empty" produces a
// successful 200 and a draft with no content — bridge moves the file
// to done thinking all is well. This validator catches unknown fields
// up-front and fails the operation with a clear message naming the
// bad field(s) and listing what IS valid.

function listSchemaAttributes(strapi, uid) {
  const model = strapi.getModel(uid);
  if (!model?.attributes) return [];
  return Object.keys(model.attributes);
}

function validateDataAgainstSchema(strapi, uid, data) {
  const valid = new Set(listSchemaAttributes(strapi, uid));
  // Internal / managed fields that are OK to pass even though they
  // aren't user attributes.
  const alwaysOk = new Set(['publishedAt', 'locale']);
  const unknown = [];
  for (const key of Object.keys(data || {})) {
    if (!valid.has(key) && !alwaysOk.has(key)) unknown.push(key);
  }
  if (unknown.length === 0) return;
  const validList = Array.from(valid).sort().join(', ');
  throw new Error(
    `Unknown field(s) for ${uid}: ${unknown.join(', ')}. ` +
    `Valid fields are: ${validList}. ` +
    `(Common mistake: Page has no body_v2 at the top level — use sections: [{ "__component": "sections.text-block", "body_v2": "..." }] instead.)`
  );
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled-' + Date.now().toString(36);
}

// ─── Strapi operations ───────────────────────────────────────────────

async function findByKey(strapi, type, keyValue) {
  // Look for the draft version first (will exist for any entry Anna is
  // actively working on), then fall back to published. documentId is
  // the same across versions so either works for update/publish calls.
  //
  // Three cases:
  //   1. Single-type (decoder-quiz-page) — one row, no filter.
  //   2. Collection with slug (article, experience, programme, …) —
  //      filter by slug.
  //   3. Collection without slug (practitioner) — filter by `name`
  //      (TYPE_KEY_FIELD override).
  const uid = TYPE_TO_UID[type];
  if (TYPE_IS_SINGLE_TYPE[type]) {
    const draft = await strapi.documents(uid).findFirst({ status: 'draft' });
    if (draft) return draft;
    return strapi.documents(uid).findFirst({ status: 'published' });
  }
  const keyField = TYPE_KEY_FIELD[type] || 'slug';
  const draft = await strapi.documents(uid).findFirst({
    filters: { [keyField]: keyValue },
    status: 'draft',
  });
  if (draft) return draft;
  return strapi.documents(uid).findFirst({
    filters: { [keyField]: keyValue },
    status: 'published',
  });
}

function getKeyFieldName(type) {
  if (TYPE_IS_SINGLE_TYPE[type]) return null;
  return TYPE_KEY_FIELD[type] || 'slug';
}

function readKeyFromEnvelope(type, parsed) {
  // Pull the identifying value from the top-level envelope. Primary
  // is the type's actual key field (slug for most, name for
  // practitioner). Also accept the generic "slug" so files Anna's
  // robot wrote against the older allowlist still work when she
  // retries them against new types.
  if (TYPE_IS_SINGLE_TYPE[type]) return null;
  const keyField = getKeyFieldName(type);
  if (parsed[keyField] != null) return parsed[keyField];
  if (parsed.slug != null) return parsed.slug;
  if (parsed.name != null) return parsed.name;
  return null;
}

async function resolveRelationValue(strapi, targetUid, value) {
  // Resolve a scalar reference (slug / name / numeric id / documentId)
  // to the target entry's documentId. Returns null if nothing matches.
  // Tries in order: numeric id → slug → name → documentId direct.
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
    try {
      const row = await strapi.db.query(targetUid).findOne({ where: { id: Number(value) } });
      if (row && row.documentId) return row.documentId;
    } catch { /* swallow */ }
  }
  if (typeof value !== 'string') return null;
  const targetModel = strapi.getModel(targetUid);
  const targetAttrs = (targetModel && targetModel.attributes) || {};
  if (targetAttrs.slug) {
    try {
      const row = await strapi.documents(targetUid).findFirst({ filters: { slug: value } });
      if (row && row.documentId) return row.documentId;
    } catch { /* swallow */ }
  }
  if (targetAttrs.name) {
    try {
      const row = await strapi.documents(targetUid).findFirst({ filters: { name: value } });
      if (row && row.documentId) return row.documentId;
    } catch { /* swallow */ }
  }
  try {
    const row = await strapi.documents(targetUid).findOne({ documentId: value });
    if (row && row.documentId) return row.documentId;
  } catch { /* swallow */ }
  return null;
}

async function resolveRelationReferences(strapi, uid, data) {
  // Walk the schema attributes of `uid` and resolve any scalar values
  // written to relation fields into real documentIds.
  //
  // Why: Anna's robot (and humans) naturally write
  //   {"category": "sessions"}
  // but Strapi's Document Service needs a documentId or numeric id for
  // a relation field. A slug string on `category` is silently coerced
  // to null — the write "succeeds", the relation stays empty, and the
  // product can't be filed. Anna hit this trying to put 14 one-to-one
  // sessions into the Sessions category (26 Oct) — revenue blocker.
  //
  // After this helper: "sessions" is looked up on the target type by
  // slug / name / id, swapped for a real documentId. If nothing
  // matches, THROW loudly so the file lands in the errors folder with
  // a clear reason — matches the "fail rather than clear" rule Anna
  // asked for.
  //
  // Objects pass through unchanged (caller may be using Strapi's
  // {connect: [...]} / {disconnect: [...]} / {id: N} forms).
  const model = strapi.getModel(uid);
  if (!model || !model.attributes) return data;
  const result = { ...data };
  for (const [field, def] of Object.entries(model.attributes)) {
    if (def.type !== 'relation') continue;
    const value = result[field];
    if (value == null) continue;
    const targetUid = def.target;
    if (!targetUid) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      const resolved = await resolveRelationValue(strapi, targetUid, value);
      if (!resolved) {
        throw new Error(`Relation "${field}" → ${targetUid}: no entry found matching "${value}". Tried slug, name, numeric id, and documentId. Supply a valid value or send the documentId directly.`);
      }
      result[field] = resolved;
      continue;
    }
    if (Array.isArray(value) && value.every((v) => typeof v === 'string' || typeof v === 'number')) {
      const resolved = [];
      for (const v of value) {
        const r = await resolveRelationValue(strapi, targetUid, v);
        if (!r) {
          throw new Error(`Relation "${field}[]" → ${targetUid}: no entry found matching "${v}" in the array. Tried slug, name, numeric id, and documentId.`);
        }
        resolved.push(r);
      }
      result[field] = resolved;
    }
  }
  return result;
}

async function resolveEnvelopeToKey(strapi, type, parsed) {
  // Resolve the envelope's identifier to a keyValue the normal
  // findByKey path can use. Accepts (in priority order):
  //   1. documentId — the Strapi 5 stable id (unambiguous)
  //   2. id         — legacy numeric id (unambiguous)
  //   3. the type's own key field (slug / name / …)
  //
  // Added 2026-10-27 after Anna hit the practitioner rename problem —
  // keying by `name` requires knowing the current name, which you
  // don't have if you're trying to rename it. documentId / id are
  // rename-safe.
  if (TYPE_IS_SINGLE_TYPE[type]) return null;
  const uid = TYPE_TO_UID[type];
  const keyField = getKeyFieldName(type);

  if (parsed.documentId) {
    let row = null;
    try { row = await strapi.documents(uid).findOne({ documentId: parsed.documentId, status: 'draft' }); } catch { /* not found */ }
    if (!row) {
      try { row = await strapi.documents(uid).findOne({ documentId: parsed.documentId, status: 'published' }); } catch { /* not found */ }
    }
    if (!row) throw new Error(`No ${type} found with documentId "${parsed.documentId}"`);
    const kv = row[keyField];
    if (kv == null) throw new Error(`${type} documentId=${parsed.documentId} has no ${keyField} to use as key`);
    return kv;
  }

  if (parsed.id != null) {
    const row = await strapi.db.query(uid).findOne({ where: { id: parsed.id } });
    if (!row) throw new Error(`No ${type} found with id ${parsed.id}`);
    const kv = row[keyField];
    if (kv == null) throw new Error(`${type} id=${parsed.id} has no ${keyField} to use as key`);
    return kv;
  }

  return readKeyFromEnvelope(type, parsed);
}

async function updateSingleTypeEntry(strapi, type, data) {
  // Single-type update. If the single-type has no row yet, create one.
  // Otherwise update the draft, and if a published row exists update
  // it too via the raw query engine (preserving publishedAt — same
  // rationale as updateStrapiEntry).
  const uid = TYPE_TO_UID[type];
  validateDataAgainstSchema(strapi, uid, data);
  const existing = await findByKey(strapi, type, null);
  if (!existing) {
    return strapi.documents(uid).create({
      data,
      status: TYPE_HAS_DRAFT_PUBLISH[type] ? 'draft' : undefined,
    });
  }
  const documentId = existing.documentId;
  const result = await strapi.documents(uid).update({
    documentId,
    data,
    status: 'draft',
  });
  if (TYPE_HAS_DRAFT_PUBLISH[type]) {
    let publishedEntry = null;
    try {
      publishedEntry = await strapi.documents(uid).findOne({ documentId, status: 'published' });
    } catch { /* not found */ }
    if (publishedEntry) {
      try {
        await strapi.db.query(uid).update({
          where: { documentId, publishedAt: { $notNull: true } },
          data,
        });
      } catch (err) {
        strapi.log.warn(`[drive-bridge] db-update published ${uid}/${documentId}: ${err.message}`);
      }
    }
  }
  return result;
}

async function createStrapiEntry(strapi, type, data) {
  const uid = TYPE_TO_UID[type];
  validateDataAgainstSchema(strapi, uid, data);
  const payload = { ...data };
  if (!TYPE_HAS_DRAFT_PUBLISH[type]) {
    // Product etc. — no draft concept, so is_active:false keeps it off
    // the public shop until Anna approves.
    payload.is_active = false;
  }
  const created = await strapi.documents(uid).create({
    data: payload,
    status: TYPE_HAS_DRAFT_PUBLISH[type] ? 'draft' : undefined,
  });
  if (TYPE_HAS_DRAFT_PUBLISH[type] && created?.documentId) {
    try {
      await strapi.documents(uid).unpublish({ documentId: created.documentId });
    } catch (err) {
      strapi.log.warn(`[drive-bridge] unpublish ${uid}/${created.documentId}: ${err.message}`);
    }
  }
  return created;
}

async function updateStrapiEntry(strapi, type, keyValue, data) {
  const uid = TYPE_TO_UID[type];
  validateDataAgainstSchema(strapi, uid, data);
  const existing = await findByKey(strapi, type, keyValue);
  if (!existing) {
    const keyField = getKeyFieldName(type) || 'id';
    throw new Error(`No ${type} found with ${keyField} "${keyValue}"`);
  }
  const documentId = existing.documentId;

  // Always update the draft version. If a published version also
  // exists, update it too so the live site reflects Anna's change
  // immediately — matches the pattern in src/utils/auto-seo.js.
  const results = {};
  try {
    results.draft = await strapi.documents(uid).update({
      documentId,
      data,
      status: 'draft',
    });
  } catch (err) {
    strapi.log.warn(`[drive-bridge] update draft ${uid}/${documentId}: ${err.message}`);
  }
  if (TYPE_HAS_DRAFT_PUBLISH[type]) {
    let publishedEntry = null;
    try {
      publishedEntry = await strapi.documents(uid).findOne({ documentId, status: 'published' });
    } catch { /* not found */ }
    if (publishedEntry) {
      // Preserve the ORIGINAL publishedAt. Anna 17 Oct: Strapi 5's
      // Document Service always re-stamps publishedAt on
      // update({status:'published'}) because publishedAt is a managed
      // field — passing it in `data` gets stripped. Across 78 posts
      // this would set every post's date to today, destroying the
      // real publication timeline.
      //
      // Fix: do the published-version update via the raw query engine
      // (strapi.db.query) which bypasses the Document Service's
      // managed-field logic. Pulls the published row by documentId +
      // publishedAt not null, writes just the fields Anna sent,
      // leaves publishedAt alone.
      const originalPublishedAt = publishedEntry.publishedAt;
      try {
        // Strip any client-sent publishedAt unless they deliberately
        // want to change it (unlikely but allowed).
        const dbWrite = Object.prototype.hasOwnProperty.call(data, 'publishedAt')
          ? { ...data }
          : { ...data };
        await strapi.db.query(uid).update({
          where: { documentId, publishedAt: { $notNull: true } },
          data: dbWrite,
        });
        results.published = { preserved_published_at: originalPublishedAt };
      } catch (err) {
        strapi.log.warn(`[drive-bridge] db-update published ${uid}/${documentId}: ${err.message}`);
      }
    }
  }
  return { ...existing, documentId };
}

async function unpublishStrapiEntry(strapi, type, keyValue) {
  const uid = TYPE_TO_UID[type];
  const existing = await findByKey(strapi, type, keyValue);
  if (!existing) {
    const keyField = getKeyFieldName(type) || 'entry';
    throw new Error(`No ${type} found with ${keyField} "${keyValue}"`);
  }
  if (!TYPE_HAS_DRAFT_PUBLISH[type]) {
    // Products use is_active toggle instead.
    return strapi.documents(uid).update({
      documentId: existing.documentId,
      data: { is_active: false },
    });
  }
  return strapi.documents(uid).unpublish({ documentId: existing.documentId });
}

async function publishStrapiEntry(strapi, type, keyValue) {
  const uid = TYPE_TO_UID[type];
  const existing = await findByKey(strapi, type, keyValue);
  if (!existing) {
    const keyField = getKeyFieldName(type) || 'entry';
    throw new Error(`No ${type} found with ${keyField} "${keyValue}"`);
  }
  if (!TYPE_HAS_DRAFT_PUBLISH[type]) {
    return strapi.documents(uid).update({
      documentId: existing.documentId,
      data: { is_active: true },
    });
  }
  return strapi.documents(uid).publish({ documentId: existing.documentId });
}

// ─── Export (read) action ────────────────────────────────────────────
//
// Writes a full entry out to Drive as a JSON file so Anna's robot can
// read the real body, SEO fields, image URL etc. and then write back
// an update. Previously the robot only had the summary from the public
// site, which is why it couldn't fix body text without rewriting blind.
//
// Shape: { "action": "export", "type": "article", "slug": "..." }
//   or:  { "action": "export", "type": "article", "all": true }
//
// Outputs land in the DRIVE_BRIDGE_EXPORTS_ID folder if set, else in
// the done folder with filenames prefixed "export-" so Anna can filter.

function toPlainText(blocks) {
  // Flatten Strapi 5 "blocks" (editor.js style) to plain text so the
  // robot can read without parsing the block tree. The robot only
  // needs to understand + rewrite content, not the formatting.
  if (!Array.isArray(blocks)) return typeof blocks === 'string' ? blocks : '';
  const parts = [];
  for (const b of blocks) {
    const inner = Array.isArray(b.children)
      ? b.children.map((c) => c.text || '').join('')
      : '';
    parts.push(inner);
  }
  return parts.join('\n\n');
}

function mediaUrlOf(media) {
  if (!media) return null;
  if (typeof media === 'string') return media;
  const url = media.url || media?.data?.attributes?.url || null;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Local upload — attach the Strapi public URL prefix. In Coolify
  // the CMS is reachable at cms.annalouwellness.com so we hard-code
  // that here. Only used in the export view, not stored.
  return `https://cms.annalouwellness.com${url}`;
}

function buildExportPayload(type, entry) {
  const data = { ...entry };
  // Normalise media fields to just the URL so the robot can look at
  // the actual image. Keep the id separately in case the robot wants
  // to reuse an already-uploaded media item (attach by id works).
  const mediaFields = [];
  for (const [k, v] of Object.entries(entry)) {
    if (v && typeof v === 'object' && (v.url || v.mime)) {
      mediaFields.push(k);
      data[`${k}_url`] = mediaUrlOf(v);
      data[`${k}_media_id`] = v.id || null;
      delete data[k];
    }
    if (Array.isArray(v) && v.length && v[0]?.url) {
      mediaFields.push(k);
      data[`${k}_urls`] = v.map(mediaUrlOf);
      data[`${k}_media_ids`] = v.map((m) => m.id).filter(Boolean);
      delete data[k];
    }
  }
  // Flatten blocks body to plain text for ease. Keep original blocks
  // under _blocks suffix in case the robot wants the structure.
  if (Array.isArray(data.body_v2)) {
    data.body_v2_plain = toPlainText(data.body_v2);
    data.body_v2_blocks = data.body_v2;
    delete data.body_v2;
  }
  if (Array.isArray(data.description_v2)) {
    data.description_v2_plain = toPlainText(data.description_v2);
    data.description_v2_blocks = data.description_v2;
    delete data.description_v2;
  }
  // Strip internal / noisy fields the robot doesn't need.
  delete data.createdAt;
  delete data.updatedAt;
  delete data.publishedAt;
  delete data.documentId;
  delete data.id;
  delete data.locale;
  return {
    exported_at: new Date().toISOString(),
    type,
    slug: entry.slug,
    data,
  };
}

async function uploadJsonToDrive(token, folderId, filename, jsonText) {
  const metadata = { name: filename, parents: [folderId], mimeType: 'application/json' };
  const boundary = '-----alw-export-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const multipart =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    jsonText + '\r\n' +
    `--${boundary}--`;
  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive export upload: ${res.status} ${txt.slice(0, 300)}`);
  }
}

async function updateFileContent(token, fileId, jsonText) {
  // PATCH the content of an EXISTING file. The owner (Anna) still owns
  // the file, so storage is charged to her — the service account doesn't
  // need its own quota. This is the workaround for the fact that a
  // service account can't create new files in a user-owned Drive
  // folder (Anna 17 Oct). She creates empty placeholder .json files;
  // we overwrite their content.
  const res = await fetch(
    `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonText,
    },
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive update file content: ${res.status} ${txt.slice(0, 300)}`);
  }
}

async function writeExportToDrive(strapi, token, folderId, filename, jsonText) {
  // Preferred path: find an existing placeholder with this name and
  // PATCH its content (works without SA storage quota).
  // Fallback 1: universal "export-output.json" placeholder.
  // Fallback 2: try to CREATE (fails on personal gmail Drives — SA
  // has 0 storage quota of its own).
  //
  // Diagnostic logging: list everything the SA can see in the folder.
  // When something fails, include the folder contents in the error so
  // Anna sees in the FAILED-filename exactly what files the SA found
  // (confirms whether sharing is actually working).
  const folderContents = await listFilesInFolder(token, folderId);
  strapi.log.info(`[drive-bridge] export: folder ${folderId} contains ${folderContents.length} file(s): ${folderContents.map((f) => f.name).join(', ') || '(empty)'}`);

  const target = String(filename).trim();
  const targetLower = target.toLowerCase();
  const targetStem = target.replace(/\.[^./\\]+$/, '').toLowerCase();

  const exact = folderContents.find((f) => f.name === target);
  const ci = folderContents.find((f) => f.name.toLowerCase() === targetLower);
  const stem = folderContents.find((f) => f.name.replace(/\.[^./\\]+$/, '').toLowerCase() === targetStem);
  const matchedFile = exact || ci || stem;
  if (matchedFile) {
    strapi.log.info(`[drive-bridge] export: matched placeholder "${matchedFile.name}" (id=${matchedFile.id})`);
    await updateFileContent(token, matchedFile.id, jsonText);
    return { mode: 'updated', id: matchedFile.id, name: matchedFile.name };
  }

  const universal = folderContents.find((f) => f.name.toLowerCase() === 'export-output.json');
  if (universal) {
    strapi.log.info(`[drive-bridge] export: no exact match, using universal placeholder "${universal.name}" (id=${universal.id})`);
    await updateFileContent(token, universal.id, jsonText);
    return { mode: 'updated-universal', id: universal.id, name: universal.name };
  }

  // No placeholder found at all — try create as last resort.
  try {
    await uploadJsonToDrive(token, folderId, filename, jsonText);
    return { mode: 'created' };
  } catch (err) {
    const contents = folderContents.length === 0
      ? '(empty)'
      : folderContents.map((f) => f.name).join(', ');
    throw new Error(
      `Could not write "${filename}". Looked for exact match + "export-output.json" fallback in exports folder, found neither. ` +
      `Create failed with: ${err.message}. ` +
      `Folder contents the service account can see: [${contents}]. ` +
      `If "export-output.json" IS in the folder but not listed above, the service account cannot see it (sharing issue — re-share the exports folder with the service account as Editor).`
    );
  }
}

async function exportStrapiEntries(strapi, type, { keyValue, all }) {
  const uid = TYPE_TO_UID[type];
  if (!uid) throw new Error(`Unknown type: ${type}`);

  // Single-type: one row, no slug, no "all" required. Just read the
  // one entry (published preferred, draft fallback).
  if (TYPE_IS_SINGLE_TYPE[type]) {
    let entry = null;
    try {
      entry = await strapi.documents(uid).findFirst({ status: 'published', populate: '*' });
    } catch { /* not found */ }
    if (!entry) {
      entry = await strapi.documents(uid).findFirst({ status: 'draft', populate: '*' });
    }
    if (!entry) throw new Error(`No ${type} content yet (single-type is empty)`);
    return [entry];
  }

  if (!keyValue && !all) {
    const keyField = getKeyFieldName(type);
    throw new Error(`export requires either "${keyField}" or "all": true`);
  }

  if (keyValue) {
    const keyField = getKeyFieldName(type);
    // Prefer the published version (that's what the public site shows)
    // and fall back to draft if no published copy exists.
    let entry = null;
    try {
      entry = await strapi.documents(uid).findFirst({
        filters: { [keyField]: keyValue },
        status: 'published',
        populate: '*',
      });
    } catch { /* not found */ }
    if (!entry) {
      entry = await strapi.documents(uid).findFirst({
        filters: { [keyField]: keyValue },
        status: 'draft',
        populate: '*',
      });
    }
    if (!entry) throw new Error(`No ${type} found with ${keyField} "${keyValue}"`);
    return [entry];
  }

  // all: true — paginate through everything, published versions.
  //
  // Bug 2026-10-27: `findMany({populate: '*'})` on a collection with
  // a `blocks` field (body_v2 on article) returns the blocks column
  // as `null` for every row even when the DB has real content.
  // Single-slug `findFirst` with the exact same populate string
  // returns the real blocks. Anna almost blanked 79 articles rewriting
  // endings off a bulk export that read every body_v2 as null.
  //
  // Workaround: use findMany only to get the slug list (lightweight,
  // no populate), then re-fetch each entry via findFirst — the same
  // code path as single-slug export, which we know returns the real
  // blocks. ~5-10s cost for 79 articles. Acceptable.
  const keyField = getKeyFieldName(type);
  const results = [];
  let start = 0;
  const limit = 100;
  while (true) {
    let page;
    try {
      page = await strapi.documents(uid).findMany({
        status: 'published',
        fields: [keyField],
        start,
        limit,
      });
    } catch (err) {
      throw new Error(`findMany ${uid} (start=${start}): ${err.message}`);
    }
    if (!page || !page.length) break;
    for (const stub of page) {
      const kv = stub && stub[keyField];
      if (kv == null) continue;
      try {
        const full = await strapi.documents(uid).findFirst({
          filters: { [keyField]: kv },
          status: 'published',
          populate: '*',
        });
        if (full) results.push(full);
      } catch (err) {
        strapi.log.warn(`[drive-bridge] bulk-export: skipping ${type}/${kv}: ${err.message}`);
      }
    }
    if (page.length < limit) break;
    start += limit;
  }
  return results;
}

// ─── File processor ──────────────────────────────────────────────────

async function processFile(strapi, token, imagesFolderId, exportsFolderId, doneId, file) {
  const bodyText = await downloadFile(token, file.id);
  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }

  const type = String(parsed.type || '').toLowerCase();
  if (!TYPE_TO_UID[type]) {
    throw new Error(`type must be one of: ${Object.keys(TYPE_TO_UID).join(', ')} (got "${parsed.type}")`);
  }

  const action = String(parsed.action || 'create').toLowerCase();
  const isSingle = !!TYPE_IS_SINGLE_TYPE[type];

  // ─── export — write entry(ies) to Drive as JSON ───
  if (action === 'export' || action === 'read') {
    const keyValueForExport = parsed.all === true
      ? null
      : (isSingle ? null : await resolveEnvelopeToKey(strapi, type, parsed));
    const entries = await exportStrapiEntries(strapi, type, {
      keyValue: keyValueForExport,
      all: parsed.all === true,
    });
    if (!entries || entries.length === 0) {
      // Hard-fail on zero matches so the file lands in errors with a
      // visible reason. Previously (bug 2026-10-27) a mistyped slug
      // would silently succeed and leave Anna wondering why nothing
      // appeared in the exports folder.
      const where = parsed.all === true ? 'bulk export' : `single export for ${JSON.stringify({ slug: parsed.slug, name: parsed.name, id: parsed.id, documentId: parsed.documentId })}`;
      throw new Error(`Export matched zero ${type} entries — ${where}. If this is a slug/name typo, re-drop the file with the correct value. If the entry is draft-only, note that bulk exports only include published entries (use a single-slug export to read drafts).`);
    }
    const targetFolder = exportsFolderId || doneId;

    if (parsed.all === true && entries.length > 1) {
      // Batch mode — write ONE aggregate file. Writing each entry to
      // its own filename was broken: when Anna only has a universal
      // `export-output.json` placeholder in the exports folder, every
      // write hits the same file and overwrites the previous entry.
      // Anna 2026-10-26: "I got 1 experience back out of 8".
      // Fix: aggregate N entries into a single JSON array and write
      // once to export-output.json. One placeholder = all entries.
      const aggregate = {
        exported_at: new Date().toISOString(),
        type,
        count: entries.length,
        entries: entries.map((e) => buildExportPayload(type, e)),
      };
      const filename = 'export-output.json';
      try {
        const res = await writeExportToDrive(strapi, token, targetFolder, filename, JSON.stringify(aggregate, null, 2));
        strapi.log.info(`[drive-bridge] export ${type} batch (${entries.length} entries): mode=${res.mode}, file="${res.name || filename}"`);
      } catch (err) {
        throw new Error(`Batch export failed: ${err.message}`);
      }
      return;
    }

    // Single entry (or single-type) — per-slug filename, universal
    // fallback kept for backward compat with existing placeholders.
    const results = { updated: 0, created: 0, universal: 0 };
    const failures = [];
    for (const entry of entries) {
      const payload = buildExportPayload(type, entry);
      const nameToken = entry.slug || entry.id || type;
      const filename = `export-${type}-${nameToken}.json`;
      try {
        const res = await writeExportToDrive(strapi, token, targetFolder, filename, JSON.stringify(payload, null, 2));
        if (res.mode === 'updated') results.updated++;
        else if (res.mode === 'updated-universal') results.universal++;
        else results.created++;
      } catch (err) {
        failures.push(`${filename}: ${err.message}`);
      }
    }
    strapi.log.info(`[drive-bridge] export ${type}: ${results.updated} updated placeholders, ${results.universal} written to universal fallback, ${results.created} newly created, ${failures.length} failed`);
    if (failures.length) {
      throw new Error(`Export completed with ${failures.length} failure(s):\n${failures.slice(0, 5).join('\n')}${failures.length > 5 ? `\n...and ${failures.length - 5} more` : ''}`);
    }
    return;
  }

  // ─── unpublish / publish — key only, no data ───
  if (action === 'unpublish' || action === 'publish') {
    const op = action === 'unpublish' ? unpublishStrapiEntry : publishStrapiEntry;
    if (isSingle) {
      const result = await op(strapi, type, null);
      strapi.log.info(`[drive-bridge] ${action} ${type} (single-type) ok (documentId=${result?.documentId})`);
      return;
    }
    const keyValue = await resolveEnvelopeToKey(strapi, type, parsed);
    if (!keyValue) {
      const keyField = getKeyFieldName(type);
      throw new Error(`"${action}" requires one of: "${keyField}", "documentId", or "id"`);
    }
    const result = await op(strapi, type, keyValue);
    strapi.log.info(`[drive-bridge] ${action} ${type}/${keyValue} ok (documentId=${result?.documentId})`);
    return;
  }

  // ─── create / update — need data ───
  const data = parsed.data || {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('data must be an object');
  }

  // Resolve any { from_file / from_url } references inside data.
  // Also handle legacy top-level media_url for backwards compat.
  let resolvedData = await resolveMediaReferences(strapi, token, imagesFolderId, data);
  if (parsed.media_url && !resolvedData[TYPE_DEFAULT_MEDIA_FIELD[type]]) {
    const mediaId = await uploadUrlToStrapi(strapi, parsed.media_url, parsed.media_filename);
    const fieldName = parsed.media_field_name || TYPE_DEFAULT_MEDIA_FIELD[type];
    resolvedData[fieldName] = TYPE_DEFAULT_MEDIA_FIELD[type] === 'images'
      ? [mediaId]
      : mediaId;
  }

  // Resolve scalar values written to relation fields (e.g.
  // `category: "sessions"` on a product) into documentIds. Throws on
  // any unresolved relation so the file lands in errors — see
  // resolveRelationReferences for the full why.
  resolvedData = await resolveRelationReferences(strapi, TYPE_TO_UID[type], resolvedData);

  // Safety net 2026-10-27: never let a null in a known rich-text /
  // dynamic-zone field reach Strapi on a write. If the robot read an
  // older bulk export (where body_v2 came back as `null` instead of
  // the real blocks) and round-trips the shape without rewriting, we
  // would blank the content. Treat null here as "no change intended".
  // Robots that genuinely want to clear a field can send an empty
  // string or empty array.
  for (const field of ['body_v2', 'description_v2']) {
    if (Object.prototype.hasOwnProperty.call(resolvedData, field) && resolvedData[field] === null) {
      strapi.log.warn(`[drive-bridge] stripped null ${field} from "${file.name}" to protect existing content`);
      delete resolvedData[field];
    }
  }

  // Single-type: there's no create vs update distinction — one row
  // only. Route both actions through updateSingleTypeEntry (which
  // creates on first write if the row doesn't exist yet).
  if (isSingle) {
    if (action !== 'create' && action !== 'update') {
      throw new Error(`action must be one of: create, update, unpublish, publish, export (got "${action}")`);
    }
    const result = await updateSingleTypeEntry(strapi, type, resolvedData);
    strapi.log.info(`[drive-bridge] ${action} ${type} (single-type) documentId=${result?.documentId} from "${file.name}"`);
    return;
  }

  if (action === 'create') {
    const keyField = getKeyFieldName(type);
    // Auto-generate slug from title for slug-keyed types if the robot
    // didn't supply one. Not needed for practitioner (keyed by name).
    if (keyField === 'slug' && !resolvedData.slug) {
      const titleValue = resolvedData[TYPE_TITLE_FIELD[type]];
      if (titleValue) resolvedData.slug = slugify(titleValue);
    }
    const created = await createStrapiEntry(strapi, type, resolvedData);
    const createdKey = created?.[keyField] || created?.slug;
    strapi.log.info(`[drive-bridge] created ${type} ${keyField}=${createdKey} documentId=${created?.documentId} from "${file.name}"`);
    return;
  }

  if (action === 'update') {
    const keyValue = await resolveEnvelopeToKey(strapi, type, parsed);
    if (!keyValue) {
      const keyField = getKeyFieldName(type);
      throw new Error(`"update" requires one of: "${keyField}", "documentId", or "id" at the top level`);
    }
    const updated = await updateStrapiEntry(strapi, type, keyValue, resolvedData);
    strapi.log.info(`[drive-bridge] updated ${type}/${keyValue} documentId=${updated?.documentId} from "${file.name}"`);
    return;
  }

  throw new Error(`action must be one of: create, update, unpublish, publish, export (got "${action}")`);
}

// ─── Cron entry point ────────────────────────────────────────────────

async function pollDriveInbox(strapi) {
  const sa = loadServiceAccount();
  if (!sa) return { skipped: true };

  const inboxId = process.env.DRIVE_BRIDGE_INBOX_ID;
  const doneId = process.env.DRIVE_BRIDGE_DONE_ID;
  const errorsId = process.env.DRIVE_BRIDGE_ERRORS_ID;
  if (!inboxId || !doneId || !errorsId) return { skipped: true };

  const imagesId = process.env.DRIVE_BRIDGE_IMAGES_ID || null;
  const exportsId = process.env.DRIVE_BRIDGE_EXPORTS_ID || null;

  const token = await mintAccessToken(sa);
  const files = await listInboxFiles(token, inboxId);
  const stats = { processed: 0, failed: 0 };

  for (const file of files) {
    try {
      await processFile(strapi, token, imagesId, exportsId, doneId, file);
      await moveFile(token, file.id, doneId, inboxId);
      stats.processed++;
    } catch (err) {
      strapi.log.error(`[drive-bridge] "${file.name}" failed: ${err.message}`);

      // === Fallback hierarchy for error visibility ===
      // Service accounts creating NEW files in a user-owned Drive
      // folder often hit storage-quota issues (service account has 0
      // quota of its own). The .error.txt upload may fail silently
      // because of this, even though sharing is correct. So we have 3
      // visibility channels, from most-reliable to least:
      //
      //   1. RENAME the file in place to include an error marker.
      //      Rename uses PATCH, no storage required, almost never
      //      fails. Anna sees the filename alone and knows WHY.
      //   2. Move file to errors/ folder (if we can).
      //   3. Try to upload a .error.txt sibling (may fail due to
      //      quota — logged in Coolify either way).
      //
      // We always attempt all three. If the first works, the user is
      // informed even if the rest fail.

      const shortErr = err.message.slice(0, 80).replace(/[\/\\:*?"<>|]/g, '-');
      const renamedName = `FAILED-[${shortErr}]-${file.name}`;
      let renamed = false;
      try {
        await renameFile(token, file.id, renamedName);
        renamed = true;
        strapi.log.info(`[drive-bridge] renamed "${file.name}" -> "${renamedName}"`);
      } catch (renameErr) {
        strapi.log.error(`[drive-bridge] rename failed for "${file.name}": ${renameErr.message}`);
      }

      const displayName = renamed ? renamedName : file.name;
      const noteName = `${displayName.replace(/\.json$/i, '')}.error.txt`;
      const noteBody = `Failed at ${new Date().toISOString()}\n\n` +
        `Original file: ${file.name}\n` +
        `Error:\n${err.message}\n\n` +
        `What to do:\n- Fix the JSON (see error above)\n- Drop the fixed file back into inbox/ with its ORIGINAL name\n- Delete this .error.txt and the FAILED-* file to tidy up\n`;

      try {
        await moveFile(token, file.id, errorsId, inboxId);
      } catch (moveErr) {
        strapi.log.error(`[drive-bridge] could not move "${displayName}" to errors (file stays in inbox with FAILED- prefix): ${moveErr.message}`);
      }

      // Try to also write a .error.txt. If it fails, the rename above
      // is still the primary visibility channel.
      let noteWrittenTo = null;
      for (const [name, folderId] of [['errors', errorsId], ['inbox', inboxId]]) {
        try {
          await uploadErrorNote(token, folderId, noteName, noteBody);
          noteWrittenTo = name;
          break;
        } catch (noteErr) {
          strapi.log.warn(`[drive-bridge] error-note upload to ${name}/ failed: ${noteErr.message}`);
        }
      }
      if (noteWrittenTo) {
        strapi.log.info(`[drive-bridge] wrote ${noteName} to ${noteWrittenTo}/`);
      } else {
        strapi.log.error(`[drive-bridge] all error-note targets failed — the FAILED- prefix on the file IS the error record`);
      }
      stats.failed++;
    }
  }

  return stats;
}

module.exports = { pollDriveInbox };
