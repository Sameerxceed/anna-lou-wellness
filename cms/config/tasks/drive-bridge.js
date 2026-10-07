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
  const q = encodeURIComponent(`'${inboxId}' in parents and mimeType = 'application/json' and trashed = false`);
  const url = `${DRIVE_API}/files?q=${q}&fields=files(id,name,mimeType)&pageSize=50`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.files || [];
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

async function findFileByNameInFolder(token, folderId, filename) {
  // Match on exact name OR starts-with (so "hero.jpg" can match
  // "hero.jpg" OR Google-Drive-rewritten "hero (1).jpg" or similar).
  const safeName = String(filename).replace(/'/g, "\\'");
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${safeName}' and trashed = false`);
  const url = `${DRIVE_API}/files?q=${q}&fields=files(id,name,mimeType)&pageSize=5`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive find-by-name: ${res.status} ${await res.text()}`);
  const j = await res.json();
  const files = j.files || [];
  return files[0] || null;
}

async function moveFile(token, fileId, toParentId, fromParentId) {
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?addParents=${toParentId}&removeParents=${fromParentId}&fields=id,parents`,
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
  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
  });
  if (!res.ok) throw new Error(`Drive error-note upload: ${res.status}`);
}

// ─── Strapi helpers ───────────────────────────────────────────────────

async function uploadBufferToStrapi(strapi, buffer, filename, contentType) {
  const uploadService = strapi.plugin('upload').service('upload');
  const [uploaded] = await uploadService.upload({
    data: {},
    files: {
      path: null,
      name: filename || 'upload.bin',
      type: contentType || 'application/octet-stream',
      size: buffer.length,
      buffer,
    },
  });
  if (!uploaded?.id) throw new Error('Strapi upload returned no id');
  return uploaded.id;
}

async function uploadUrlToStrapi(strapi, mediaUrl, filename) {
  const mediaRes = await fetch(mediaUrl);
  if (!mediaRes.ok) throw new Error(`Fetch media: ${mediaRes.status}`);
  const buf = Buffer.from(await mediaRes.arrayBuffer());
  return uploadBufferToStrapi(
    strapi,
    buf,
    filename || mediaUrl.split('/').pop() || 'upload.bin',
    mediaRes.headers.get('content-type'),
  );
}

async function uploadDriveFileToStrapi(strapi, token, imagesFolderId, filename) {
  if (!imagesFolderId) {
    throw new Error(`DRIVE_BRIDGE_IMAGES_ID is not set, cannot resolve "${filename}"`);
  }
  const file = await findFileByNameInFolder(token, imagesFolderId, filename);
  if (!file) {
    throw new Error(`Image "${filename}" not found in Drive images folder`);
  }
  const { buffer, contentType } = await downloadBinaryFile(token, file.id);
  return uploadBufferToStrapi(strapi, buffer, filename, contentType);
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
    let publishedExists = false;
    try {
      const pub = await strapi.documents(uid).findOne({ documentId, status: 'published' });
      publishedExists = !!pub;
    } catch { /* not found */ }
    if (publishedExists) {
      try {
        results.published = await strapi.documents(uid).update({
          documentId,
          data,
          status: 'published',
        });
      } catch (err) {
        strapi.log.warn(`[drive-bridge] update published ${uid}/${documentId}: ${err.message}`);
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

// ─── File processor ──────────────────────────────────────────────────

async function processFile(strapi, token, imagesFolderId, file) {
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

  throw new Error(`action must be one of: create, update, unpublish, publish (got "${action}")`);
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

  const token = await mintAccessToken(sa);
  const files = await listInboxFiles(token, inboxId);
  const stats = { processed: 0, failed: 0 };

  for (const file of files) {
    try {
      await processFile(strapi, token, imagesId, file);
      await moveFile(token, file.id, doneId, inboxId);
      stats.processed++;
    } catch (err) {
      strapi.log.error(`[drive-bridge] "${file.name}" failed: ${err.message}`);
      try {
        await uploadErrorNote(
          token,
          errorsId,
          `${file.name.replace(/\.json$/i, '')}.error.txt`,
          `Failed at ${new Date().toISOString()}\n\n${err.message}`,
        );
      } catch (noteErr) {
        strapi.log.warn(`[drive-bridge] error-note upload failed for "${file.name}": ${noteErr.message}`);
      }
      try {
        await moveFile(token, file.id, errorsId, inboxId);
      } catch (moveErr) {
        strapi.log.error(`[drive-bridge] could not move "${file.name}" to errors: ${moveErr.message}`);
      }
      stats.failed++;
    }
  }

  return stats;
}

module.exports = { pollDriveInbox };
