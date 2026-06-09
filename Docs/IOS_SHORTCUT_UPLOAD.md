# iPhone Shortcut — "Upload to ALW CMS"

A one-tap workflow that uploads a photo from Anna's camera roll straight
into the Strapi media library. Reduces the upload step from "open CMS → 5
taps" to "share from Photos → Upload to CMS → done."

This is set up **once** on the phone. After that, every photo upload
takes ~5 seconds.

## What it does

1. Anna takes a photo (or selects from camera roll)
2. Taps the Share button
3. Picks **Upload to ALW CMS** from the share sheet
4. Confirmation appears: "Uploaded · 4 MB"
5. Photo is now in the Media Library, available to attach to any
   content from the CMS

## What it does NOT do

- Does not attach the photo to a specific page. Anna still opens the
  Quick Photos panel in CMS (or the entry directly) and picks the
  newly uploaded photo. The Shortcut is purely an **upload accelerator**
  — it shaves the upload step, not the attach step.

## One-time setup

### Step 1 — create a Strapi API token

1. From a desktop browser, go to `https://cms.annalouwellness.com/admin`
2. Settings → **API Tokens** → **Create new API Token**
3. Fill in:
   - Name: `Anna iPhone Upload`
   - Token duration: **Unlimited**
   - Token type: **Full access**
4. Copy the token immediately (Strapi only shows it once). Send it to
   Anna's phone via WhatsApp/AirDrop, or just type it manually into the
   Shortcut in the next step.

### Step 2 — build the Shortcut on Anna's iPhone

On the iPhone:

1. Open the **Shortcuts** app (built in to iOS — comes pre-installed)
2. Tap **+** (top right) to create a new shortcut
3. Rename it to **Upload to ALW CMS** (tap the title at the top)
4. Tap **Add Action** and add these actions in order:

   **Action 1: Get Contents of URL**
   - URL: `https://cms.annalouwellness.com/api/upload`
   - Method: **POST**
   - Request Body: **Form**
   - Add a form field:
     - Key: `files`
     - Value: tap the field → magic-variable button → **Shortcut Input**
       (this is the photo coming from the share sheet)
     - Type: **File**
   - Headers:
     - Authorization: `Bearer paste-the-api-token-from-step-1-here`
     - (no Content-Type — iOS sets the multipart boundary automatically)

   **Action 2: Show Notification**
   - Title: `Uploaded to CMS`
   - Body: tap → **Shortcut Input** → **Name** (shows the filename)

5. Tap the settings icon at the top of the Shortcut editor:
   - Toggle **Show in Share Sheet** on
   - Accepted Types: **Images** only (toggle others off)
6. **Done** (top right) to save

### Step 3 — pin it to the share sheet (one more tap)

The first time Anna uses it from the share sheet, the Shortcut appears
in the "..." overflow. To make it permanent:

1. Take any photo
2. Tap Share
3. Scroll past the apps row to **Edit Actions** (bottom)
4. Find **Upload to ALW CMS** in the list, tap the green **+** to add it
5. Drag it to the top of the **Favourites** section
6. Done — now it's a one-tap option in the share sheet forever

## Day-to-day use

1. Snap photo (camera) or open existing one (Photos)
2. Tap Share button
3. Tap **Upload to ALW CMS** in the share sheet
4. Wait ~2-5 seconds for "Uploaded to CMS" notification
5. Photo is in Strapi Media Library

To attach the photo to a page after upload: open CMS → **Quick Photos**
panel (left sidebar) → find the section → **Replace** → pick the just-
uploaded photo → publish.

## Troubleshooting

**"401 Unauthorized" in the notification**
The API token is wrong, expired, or was deleted. Reissue the token at
Strapi → Settings → API Tokens, paste the new one into the Shortcut's
Authorization header.

**"413 Payload Too Large"**
The photo is over 50 MB. Open it in Photos → tap Edit → reduce
brightness slightly (this re-encodes the file at a smaller size when
you save) → re-upload. Or shoot at a lower iPhone camera resolution.

**Filename comes out as "image.jpg" every time**
This is iOS's default for shared images. Strapi's image-resize
middleware slugifies these — they'll still be findable in the Media
Library, but consider naming the file in Photos before sharing if it's
an important photo.

**Photos appear sideways**
The image-resize middleware auto-rotates via EXIF on upload. If a
photo lands sideways, it's an iPhone photo missing EXIF orientation
data — rare. Open in Photos → rotate manually → re-share.

## Security note

The API token has **Full access** to the CMS. Anyone with it can
upload, modify, or delete content. Don't share the token or the
Shortcut file outside Anna's phone. If the phone is ever lost or the
token leaks:

1. Go to Strapi admin → Settings → API Tokens
2. Find `Anna iPhone Upload`
3. **Delete** it (revokes access immediately)
4. Create a new token, update the Shortcut on the new phone

## A note about the manual path

If the Shortcut isn't set up yet (new phone, fresh install), Anna can
always fall back to the standard CMS upload:

1. Open `cms.annalouwellness.com/admin` on the phone
2. Media Library → **Add new assets**
3. Pick from camera roll
4. Tap **Upload assets to the library**

That's the same flow but takes ~5 taps instead of 2.
