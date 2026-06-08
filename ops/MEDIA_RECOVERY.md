# Media Recovery — bulk re-upload after Strapi /uploads wipe

Use these scripts when Strapi media records exist in the database but
the underlying files on disk are gone (e.g. after a Docker volume mishap
or a host migration). They preserve all content references — homepage
hero, programme images, page builder sections, etc. — by re-uploading
files INTO the existing media records rather than creating new ones.

## When to use

- Media library shows broken-image previews
- A direct URL like `https://cms.annalouwellness.com/uploads/<file>.jpeg`
  returns `{"data":null,"error":{"status":404,...}}`
- You've already added a persistent volume mount so future uploads
  survive — recovery is now safe (the restored files won't get wiped
  again on next redeploy)

## Setup (one-time)

1. **Create a Strapi admin API token**
   - Go to: `https://cms.annalouwellness.com/admin`
   - Settings → API Tokens → **Create new API Token**
   - Name: `media-recovery`
   - Type: `Full access`
   - Duration: `Unlimited` (you can delete the token after recovery)
   - **Copy the token immediately** — Strapi only shows it once
2. Set it as an environment variable in your terminal:
   ```powershell
   # PowerShell (current session)
   $env:STRAPI_ADMIN_TOKEN = "paste-token-here"
   ```
   ```bash
   # Bash / Git Bash
   export STRAPI_ADMIN_TOKEN="paste-token-here"
   ```

## Step 1 — List which files are broken

```powershell
node ops/list-broken-uploads.js
```

This walks every media record in Strapi, HEAD-checks the public URL of
each, and prints a list of original filenames whose URL returns 404.
It also writes `ops/broken-uploads.json` (used by step 3).

The list is formatted as a copy-paste-able bullet list — paste it
straight into WhatsApp/email to Anna:

> "Hey Anna — can you zip these specific photos and send them over?
>  Just the files in this list, doesn't have to be the whole library."

## Step 2 — Anna sends the source files

Anna zips the files (or shares via Google Drive / WhatsApp document).
You download + extract somewhere on your laptop, e.g.:

```
C:\Users\Sameer Vitkar\Downloads\anna-photos\
  001.jpeg
  002.jpeg
  031.jpeg
  DSC01523.jpg
  ...
```

A flat folder OR a folder with one level of nesting both work.

## Step 3 — Run the restore

**First do a dry run** to preview what will be matched without actually
uploading anything:

```powershell
$env:DRY_RUN = "1"
node ops/restore-uploads.js "C:\Users\Sameer Vitkar\Downloads\anna-photos"
```

You'll see:
- How many source files matched a broken record
- How many source files DIDN'T match (probably wrong filename)
- How many broken records are still missing from the folder (ask Anna
  for those)

If the matches look right, **run for real**:

```powershell
$env:DRY_RUN = "0"
node ops/restore-uploads.js "C:\Users\Sameer Vitkar\Downloads\anna-photos"
```

Each file uploads in place into its existing Strapi record. The record
keeps its `id`, `documentId`, and all the content references stay
intact. No re-linking needed.

## After recovery

1. Hard-refresh `https://staging.annalouwellness.com` and any other
   page that should now have images
2. Check Strapi → Media Library → confirm previews load
3. **Delete the API token** at Strapi → Settings → API Tokens
   (security hygiene — don't leave full-access tokens lying around)

## How the matching works

Three tiers, tried in order:
1. **Exact match** on the recorded filename (`031.jpeg` → `031.jpeg`)
2. **Case-insensitive** match (`IMG_5847.JPEG` → `img_5847.jpeg`)
3. **Basename match** (extension ignored — `031.jpg` would match a
   broken `031.jpeg` record)

If a source file matches NO broken record, it's reported but NOT
uploaded. This is intentional — we don't want to create new media
records by accident.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `STRAPI_ADMIN_TOKEN env var is required` | Token not exported in current shell | Re-export with `$env:STRAPI_ADMIN_TOKEN = "..."` |
| `Strapi files API 401` | Token expired or wrong | Create a new token, re-export |
| `Strapi files API 403` | Token type isn't "Full access" | Recreate with Full access |
| Source files all show as "Unmatched" | Filenames in the zip don't match what Strapi recorded | Open `broken-uploads.json` to see exact recorded filenames; rename source files to match, then re-run |
| Replace returns 500 | File too large (>50 MB) or unsupported format | Resize source image; HEIC files should auto-convert via the image-resize middleware |
