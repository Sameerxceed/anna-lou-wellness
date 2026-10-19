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
 *     "action": "create" | "update" | "unpublish" | "publish",
 *     "type":   "article" | "experience" | "page" | "product" | "vault-journey",
 *     "slug":   "my-item"      // required for update/unpublish/publish
 *     "data":   { ... }        // field map, required for create/update
 *   }
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
};

const TYPE_TITLE_FIELD = {
  'article': 'title',
  'experience': 'name',
  'page': 'title',
  'product': 'name',
  'vault-journey': 'name',
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
};

// Which types have draftAndPublish:true. Products do not.
const TYPE_HAS_DRAFT_PUBLISH = {
  'article': true,
  'experience': true,
  'page': true,
  'product': false,
  'vault-journey': true,
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

async function findBySlug(strapi, uid, slug) {
  // Look for the draft version first (will exist for any entry Anna is
  // actively working on), then fall back to published. documentId is
  // the same across versions so either works for update/publish calls.
  const draft = await strapi.documents(uid).findFirst({
    filters: { slug },
    status: 'draft',
  });
  if (draft) return draft;
  return strapi.documents(uid).findFirst({
    filters: { slug },
    status: 'published',
  });
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

async function updateStrapiEntry(strapi, type, slug, data) {
  const uid = TYPE_TO_UID[type];
  validateDataAgainstSchema(strapi, uid, data);
  const existing = await findBySlug(strapi, uid, slug);
  if (!existing) {
    throw new Error(`No ${type} found with slug "${slug}"`);
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

async function unpublishStrapiEntry(strapi, type, slug) {
  const uid = TYPE_TO_UID[type];
  if (!TYPE_HAS_DRAFT_PUBLISH[type]) {
    // Products use is_active toggle instead.
    const existing = await findBySlug(strapi, uid, slug);
    if (!existing) throw new Error(`No ${type} found with slug "${slug}"`);
    return strapi.documents(uid).update({
      documentId: existing.documentId,
      data: { is_active: false },
    });
  }
  const existing = await findBySlug(strapi, uid, slug);
  if (!existing) throw new Error(`No ${type} found with slug "${slug}"`);
  return strapi.documents(uid).unpublish({ documentId: existing.documentId });
}

async function publishStrapiEntry(strapi, type, slug) {
  const uid = TYPE_TO_UID[type];
  if (!TYPE_HAS_DRAFT_PUBLISH[type]) {
    const existing = await findBySlug(strapi, uid, slug);
    if (!existing) throw new Error(`No ${type} found with slug "${slug}"`);
    return strapi.documents(uid).update({
      documentId: existing.documentId,
      data: { is_active: true },
    });
  }
  const existing = await findBySlug(strapi, uid, slug);
  if (!existing) throw new Error(`No ${type} found with slug "${slug}"`);
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

async function exportStrapiEntries(strapi, type, { slug, all }) {
  const uid = TYPE_TO_UID[type];
  if (!uid) throw new Error(`Unknown type: ${type}`);
  if (!slug && !all) throw new Error('export requires either "slug" or "all": true');

  if (slug) {
    // Prefer the published version (that's what the public site shows)
    // and fall back to draft if no published copy exists.
    let entry = null;
    try {
      entry = await strapi.documents(uid).findFirst({
        filters: { slug },
        status: 'published',
        populate: '*',
      });
    } catch { /* not found */ }
    if (!entry) {
      entry = await strapi.documents(uid).findFirst({
        filters: { slug },
        status: 'draft',
        populate: '*',
      });
    }
    if (!entry) throw new Error(`No ${type} found with slug "${slug}"`);
    return [entry];
  }

  // all: true — paginate through everything, published versions.
  // Strapi 5 Document Service findMany uses start/limit directly (not
  // wrapped in pagination:{}). Explicit pageSize of 100 keeps response
  // sizes sane and matches Strapi's default max.
  const results = [];
  let start = 0;
  const limit = 100;
  while (true) {
    let page;
    try {
      page = await strapi.documents(uid).findMany({
        status: 'published',
        populate: '*',
        start,
        limit,
      });
    } catch (err) {
      throw new Error(`findMany ${uid} (start=${start}): ${err.message}`);
    }
    if (!page || !page.length) break;
    results.push(...page);
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

  // ─── export — write entry(ies) to Drive as JSON ───
  if (action === 'export' || action === 'read') {
    const entries = await exportStrapiEntries(strapi, type, {
      slug: parsed.slug,
      all: parsed.all === true,
    });
    const targetFolder = exportsFolderId || doneId;
    const results = { updated: 0, created: 0, universal: 0 };
    const failures = [];
    for (const entry of entries) {
      const payload = buildExportPayload(type, entry);
      const filename = `export-${type}-${entry.slug || entry.id}.json`;
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

  // ─── unpublish / publish — slug only, no data ───
  if (action === 'unpublish' || action === 'publish') {
    const slug = parsed.slug;
    if (!slug) throw new Error(`"${action}" requires "slug"`);
    const op = action === 'unpublish' ? unpublishStrapiEntry : publishStrapiEntry;
    const result = await op(strapi, type, slug);
    strapi.log.info(`[drive-bridge] ${action} ${type}/${slug} ok (documentId=${result?.documentId})`);
    return;
  }

  // ─── create / update — need data ───
  const data = parsed.data || {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('data must be an object');
  }

  // Resolve any { from_file / from_url } references inside data.
  // Also handle legacy top-level media_url for backwards compat.
  const resolvedData = await resolveMediaReferences(strapi, token, imagesFolderId, data);
  if (parsed.media_url && !resolvedData[TYPE_DEFAULT_MEDIA_FIELD[type]]) {
    const mediaId = await uploadUrlToStrapi(strapi, parsed.media_url, parsed.media_filename);
    const fieldName = parsed.media_field_name || TYPE_DEFAULT_MEDIA_FIELD[type];
    resolvedData[fieldName] = TYPE_DEFAULT_MEDIA_FIELD[type] === 'images'
      ? [mediaId]
      : mediaId;
  }

  if (action === 'create') {
    if (!resolvedData.slug) {
      const titleValue = resolvedData[TYPE_TITLE_FIELD[type]];
      if (titleValue) resolvedData.slug = slugify(titleValue);
    }
    const created = await createStrapiEntry(strapi, type, resolvedData);
    strapi.log.info(`[drive-bridge] created ${type} slug=${created?.slug} documentId=${created?.documentId} from "${file.name}"`);
    return;
  }

  if (action === 'update') {
    const slug = parsed.slug;
    if (!slug) throw new Error('"update" requires "slug" at the top level');
    const updated = await updateStrapiEntry(strapi, type, slug, resolvedData);
    strapi.log.info(`[drive-bridge] updated ${type}/${slug} documentId=${updated?.documentId} from "${file.name}"`);
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
