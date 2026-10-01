# Drive Bridge — setup runbook

## What this does
Every 10 minutes, the CMS checks a Google Drive folder owned by Anna.
Any JSON file in `inbox/` is turned into a Strapi draft (article,
vault-journey, or product). The file then moves to `done/` on success
or `errors/` on failure (with a sibling `.error.txt`).

No egress needed from Anna's side: her AI assistant can write to Drive
even though it cannot POST to our Strapi API.

## One-off: create the service account (Sameer)

1. https://console.cloud.google.com → pick or create a project (name it
   e.g. `anna-lou-wellness`).
2. APIs & Services → Library → enable **Google Drive API**.
3. IAM & Admin → Service Accounts → Create service account:
   - Name: `alw-cms-bridge`
   - Role: skip (project-level roles not needed)
   - Done.
4. Click the new service account → Keys → Add key → JSON → downloads
   a `.json` file.
5. Copy the `client_email` from that JSON — Anna needs it to share her
   folder.

## One-off: Anna's side

1. Open Google Drive, create a folder called `ALW CMS Bridge`.
2. Inside it, create three subfolders: `inbox`, `done`, `errors`.
3. Right-click the top folder → Share → paste the service account email
   (`something@something.iam.gserviceaccount.com`) → set to **Editor** →
   Send.
4. Open each of the three subfolders in turn and copy the folder ID
   from the URL (it's the last path segment after `/folders/`).
5. Send Sameer the three folder IDs.

## One-off: wire the env vars (Sameer, Coolify)

In Coolify → CMS app → Environment Variables, add:

```
DRIVE_BRIDGE_SA_JSON       <paste the ENTIRE JSON file as one line>
DRIVE_BRIDGE_INBOX_ID      <folder id from step 4 above>
DRIVE_BRIDGE_DONE_ID       <folder id>
DRIVE_BRIDGE_ERRORS_ID     <folder id>
DRIVE_BRIDGE_STRAPI_URL    http://localhost:1337
DRIVE_BRIDGE_STRAPI_TOKEN  <same STRAPI_ADMIN_API_TOKEN we use elsewhere>
```

Important: `DRIVE_BRIDGE_SA_JSON` must be the full JSON, including the
`\n` escapes in the private_key. Paste it exactly as it comes out of
the downloaded file.

Save → Redeploy CMS. The cron starts firing within 10 min.

## JSON file shape (what Anna's robot writes to `inbox/`)

Articles (Reset Stories):
```json
{
  "type": "article",
  "data": {
    "title": "Three months to reclaim yourself",
    "body_v2": "Lorem ipsum...",
    "excerpt": "A short lede for the card.",
    "focus_keyword": "nervous system recovery",
    "tags": "burnout, recovery, somatic"
  },
  "media_url": "https://example.com/hero.jpg"
}
```

Meditations (Reset Room Vault Journey):
```json
{
  "type": "vault-journey",
  "data": {
    "name": "Morning reset meditation",
    "description": "A 10-minute wake-up practice.",
    "kind": "Audio meditation",
    "duration": "10 min"
  },
  "media_url": "https://example.com/thumb.jpg"
}
```

Products:
```json
{
  "type": "product",
  "data": {
    "name": "Rose quartz pendant",
    "price": 89.00,
    "short_description": "Hand-set rose quartz on silver chain.",
    "stock": 12
  },
  "media_url": "https://example.com/product.jpg"
}
```

Draft behaviour:
- Articles and vault-journeys land as **Draft** (publishedAt null).
- Products land as **is_active: false** so they stay hidden from the
  shop until Anna ticks is_active.

Anna reviews everything in CMS and publishes or activates manually.

## Verification

- Drop a test JSON into `inbox/`.
- Within 10 min, check it has moved to `done/`.
- Open CMS → the collection → filter by Draft (or is_active: false for
  products). The entry should be there.
- If it moved to `errors/` instead, open the sibling `.error.txt` for
  the reason.
