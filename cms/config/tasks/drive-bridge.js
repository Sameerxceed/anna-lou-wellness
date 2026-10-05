'use strict';

/**
 * Drive Bridge — poll Anna's Google Drive inbox folder every 10 minutes
 * and create Strapi drafts from any JSON files found.
 *
 * Why: Anna's AI assistant (Claude robots) cannot POST to our Strapi API
 * directly — her side blocks outbound HTTPS to arbitrary domains with a
 * 403 CONNECT tunnel refusal. Google Drive IS on her allowlist, so we
 * pull from a folder she owns instead of letting her robot push to us.
 *
 * Flow per tick:
 *   1. List *.json files in INBOX folder (query = parents + mimeType)
 *   2. For each file: download, parse, validate shape
 *   3. If media_url is present, download it, upload to Strapi media,
 *      swap the URL for the returned media id
 *   4. POST to Strapi as draft (publishedAt: null for article/vault-journey;
 *      is_active: false for product since it has no draft/publish toggle)
 *   5. Move file to DONE/YYYY-MM-DD/ subfolder on success, or to ERRORS/
 *      with a sibling .error.txt explaining what Strapi rejected
 *
 * JSON file shape expected (one entry per file):
 *   {
 *     "type": "article" | "vault-journey" | "product",
 *     "data": { ...fields matching the schema... },
 *     "media_url": "https://example.com/image.jpg"   // optional
 *   }
 *
 * Auth: service account JSON (not an OAuth app) so there's no refresh-
 * token dance. We mint a short-lived access token from the JWT every
 * tick. No npm deps — raw crypto + fetch only.
 *
 * Env vars:
 *   DRIVE_BRIDGE_SA_JSON       Full service account JSON (one-line, no newlines in private key — use \\n)
 *   DRIVE_BRIDGE_INBOX_ID      Google Drive folder ID of the inbox
 *   DRIVE_BRIDGE_DONE_ID       Google Drive folder ID for completed files
 *   DRIVE_BRIDGE_ERRORS_ID     Google Drive folder ID for failed files
 *   DRIVE_BRIDGE_STRAPI_URL    (defaults to http://localhost:1337)
 *   DRIVE_BRIDGE_STRAPI_TOKEN  (defaults to admin token used elsewhere)
 *
 * Anna's setup side:
 *   - Create a folder 'ALW CMS Bridge' in her Drive
 *   - Create subfolders: inbox, done, errors
 *   - Share the parent folder with the service account email (Editor)
 *   - Send the three folder IDs to Sameer who sets the env vars
 */

const crypto = require('crypto');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

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

async function uploadMediaToStrapi(strapi, mediaUrl, filename) {
  const mediaRes = await fetch(mediaUrl);
  if (!mediaRes.ok) throw new Error(`Fetch media: ${mediaRes.status}`);
  const buf = Buffer.from(await mediaRes.arrayBuffer());

  const uploadService = strapi.plugin('upload').service('upload');
  // Strapi's upload service expects a Multer-style file descriptor.
  const [uploaded] = await uploadService.upload({
    data: {},
    files: {
      path: null,
      name: filename || 'upload.bin',
      type: mediaRes.headers.get('content-type') || 'application/octet-stream',
      size: buf.length,
      buffer: buf,
    },
  });
  if (!uploaded?.id) throw new Error('Strapi upload returned no id');
  return uploaded.id;
}

const TYPE_TO_ENDPOINT = {
  'article': 'articles',
  'vault-journey': 'vault-journeys',
  'product': 'products',
};

const TYPE_TO_UID = {
  'article': 'api::article.article',
  'vault-journey': 'api::vault-journey.vault-journey',
  'product': 'api::product.product',
};

// Slug derivation when the robot omits one. Strapi's REST API doesn't
// run the UID auto-fill that the admin UI does, so a missing slug is
// a hard 400. Mirror the standard lowercase+hyphens pattern that
// Strapi's own UID field uses.
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled-' + Date.now().toString(36);
}

const TYPE_TITLE_FIELD = {
  'article': 'title',
  'vault-journey': 'name',
  'product': 'name',
};

// For each type, what fields hold a media reference the bridge should
// swap for a Strapi media id. The media_url top-level field is the
// generic one; type-specific media_field_name lets Anna aim at a
// different attribute (e.g. hero_image vs images[]).
const TYPE_MEDIA_FIELD = {
  'article': 'hero_image',
  'vault-journey': 'video_thumbnail',
  'product': 'images',
};

async function createStrapiEntry(strapi, type, data) {
  const uid = TYPE_TO_UID[type];
  if (!uid) throw new Error(`Unknown type: ${type}`);
  const payload = { ...data };
  if (type === 'product') {
    // Product has draftAndPublish:false. is_active:false hides it from
    // the public shop until Anna reviews.
    payload.is_active = false;
  }

  // Strapi 5.40 Document Service: create() with status:'draft' is
  // supposed to produce a draft-only entry, but in 5.40 it still
  // produces both a draft and a published version. So we follow up
  // with an explicit unpublish for draft-aware types. Unpublish keeps
  // the draft version intact, just removes the published copy — which
  // is exactly what 'draft only' should look like.
  const created = await strapi.documents(uid).create({
    data: payload,
    status: type === 'product' ? undefined : 'draft',
  });

  if (type !== 'product' && created?.documentId) {
    try {
      await strapi.documents(uid).unpublish({ documentId: created.documentId });
    } catch (err) {
      strapi.log.warn(`[drive-bridge] unpublish ${uid}/${created.documentId}: ${err.message}`);
    }
  }

  return created;
}

async function processFile(strapi, token, file) {
  const bodyText = await downloadFile(token, file.id);
  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }
  const type = String(parsed.type || '').toLowerCase();
  if (!TYPE_TO_ENDPOINT[type]) {
    throw new Error(`type must be one of: ${Object.keys(TYPE_TO_ENDPOINT).join(', ')} (got "${parsed.type}")`);
  }
  const data = parsed.data || {};
  if (!data || typeof data !== 'object') throw new Error('data must be an object');

  // Auto-derive slug from the title/name field when the robot omits
  // one. The Document Service enforces required UIDs just like REST.
  if (!data.slug) {
    const titleField = TYPE_TITLE_FIELD[type];
    const titleValue = data[titleField];
    if (titleValue) {
      data.slug = slugify(titleValue);
    }
  }

  // Optional media sideload: if media_url is present, download it,
  // upload to Strapi, and attach to the correct field for this type.
  if (parsed.media_url) {
    const mediaId = await uploadMediaToStrapi(strapi, parsed.media_url, parsed.media_filename);
    const fieldName = parsed.media_field_name || TYPE_MEDIA_FIELD[type];
    if (type === 'product') {
      data[fieldName] = [mediaId];
    } else {
      data[fieldName] = mediaId;
    }
  }

  const created = await createStrapiEntry(strapi, type, data);
  strapi.log.info(`[drive-bridge] created ${type} id=${created?.id} documentId=${created?.documentId} from "${file.name}"`);
}

async function pollDriveInbox(strapi) {
  const sa = loadServiceAccount();
  if (!sa) {
    // Not configured — silently skip. Logging a warning every 10 min
    // would be noisy; Anna probably hasn't sent folder IDs yet.
    return { skipped: true };
  }
  const inboxId = process.env.DRIVE_BRIDGE_INBOX_ID;
  const doneId = process.env.DRIVE_BRIDGE_DONE_ID;
  const errorsId = process.env.DRIVE_BRIDGE_ERRORS_ID;
  if (!inboxId || !doneId || !errorsId) {
    return { skipped: true };
  }
  // Strapi URL/token no longer needed — we talk to Strapi via its
  // internal Document Service directly (same process). This also
  // eliminates the token-permission limitations on the REST Content API
  // (publish/unpublish not exposed, draft creation not possible).

  const token = await mintAccessToken(sa);
  const files = await listInboxFiles(token, inboxId);
  const stats = { processed: 0, failed: 0 };

  for (const file of files) {
    try {
      await processFile(strapi, token, file);
      await moveFile(token, file.id, doneId, inboxId);
      stats.processed++;
    } catch (err) {
      strapi.log.error(`[drive-bridge] "${file.name}" failed: ${err.message}`);
      // Try to leave a sibling .error.txt in the errors folder for
      // Anna's visibility, but do NOT let a failure here stop us from
      // moving the file out of inbox — otherwise we loop forever on
      // the same bad file every 10 minutes.
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
