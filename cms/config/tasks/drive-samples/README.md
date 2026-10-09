# ALW CMS Bridge — JSON reference

Drop a `.json` file into the `inbox` folder. Within 10 minutes:
- It gets picked up
- The action runs against the CMS
- The file moves to `done/YYYY-MM-DD/` on success
- Or `errors/` with a sibling `.error.txt` explaining what went wrong

## The envelope

Every file has this shape:

```json
{
  "action": "create" | "update" | "unpublish" | "publish",
  "type":   "article" | "experience" | "page" | "product" | "vault-journey",
  "slug":   "my-item-slug",
  "data":   { ... fields ... }
}
```

- `action` is optional. Defaults to `"create"` so old files keep working.
- `slug` is required for `update`, `unpublish`, `publish`. For `create` it auto-fills from the title/name if omitted.
- `data` is required for `create` and `update`. Not needed for `unpublish` or `publish`.

## Type values (what to put after `"type":`)

| What you're writing  | type value          | Lives at          |
| -------------------- | ------------------- | ----------------- |
| Reset Story / blog   | `article`           | /reset-stories/.. |
| Retreat / workshop   | `experience`        | /experiences/..   |
| Custom page          | `page`              | /p/..             |
| Shop product         | `product`           | /shop/..          |
| Meditation / audio   | `vault-journey`     | Reset Room Vault  |

## Images

Any field that takes an image can be a `from_file` reference. Put the
image in the `images/` folder on Drive (same parent as `inbox`), then:

```json
"hero_image": { "from_file": "big-exhale-hero.jpg" }
```

The bridge finds the file, uploads it to the Strapi media library, and
attaches it to the field. Works at any depth.

For an array of images (products):
```json
"images": [
  { "from_file": "product-1.jpg" },
  { "from_file": "product-2.jpg" }
]
```

If you have a photo somewhere on the web instead of in Drive:
```json
"hero_image": { "from_url": "https://example.com/photo.jpg" }
```

## Display order

Every retreat / article / page has a `sort_order` field. Lower numbers
appear first. Use steps of 10 (10, 20, 30) so you can drop new items
between existing ones without renumbering everything.

```json
{
  "action": "update",
  "type": "experience",
  "slug": "big-exhale-retreat",
  "data": { "sort_order": 10 }
}
```

## Everything created lands as a draft

For articles, experiences, pages and vault journeys, new items land as
Drafts. You review in CMS and hit Publish when ready. Products land
with `is_active: false` so they stay off the shop until you tick it.

Updates and unpublish are instant. If you update a published item the
live site reflects the change within a minute or two.

## Error recovery

If a file ends up in `errors/`:
- Open the `.error.txt` next to it for the reason
- Fix the JSON
- Drop the fixed version back in `inbox/`
- Delete the old file from `errors/` so it doesn't clutter

If an `.error.txt` appears in `inbox/` instead of `errors/`, that means
the errors folder sharing didn't inherit from the parent correctly.
The error file is readable either way. Fix by right-clicking the
errors folder → Share → re-add the service account email as Editor.

Common errors:
- `Unknown field(s) for ...` — the JSON contains a field name the
  content type doesn't have. The error lists every valid field so you
  can see what to use instead. Classic case: `body_v2` at the top of a
  Page — Pages use `sections` (see the Pages section above).
- `type must be one of ...` — typo in the `type` field
- `No X found with slug "Y"` — slug doesn't exist (check spelling)
- `from_file "X.jpg" not found` — image missing from images folder OR
  spelled differently OR images folder not shared. The bridge now
  checks case-insensitively AND stem-only (so "hero" finds "hero.jpg"),
  so the only remaining reasons are: file not in the folder, or the
  images folder isn't shared with the service account.
- `from_url "..." returned HTTP ...` — the URL is dead or a signed URL
  that expired. Signed URLs typically die within minutes; the bridge
  polls every 10 min so they may be gone by the time we try. Use
  `from_file` with the images folder for anything that isn't a stable
  public URL.

## Pages (`type: "page"`) are different — use sections

Page has NO body or body_v2 at the top level. The body is built from
a stack of section components inside a `sections` array. If you send
`body_v2` on a Page, the bridge now rejects the file with a clear
error (previously it silently dropped the field and left the page
empty).

Minimum page with one text block:

```json
{
  "action": "create",
  "type": "page",
  "data": {
    "title": "The Lock In",
    "sections": [
      {
        "__component": "sections.text-block",
        "heading": "The invitation",
        "body_v2": "First paragraph.\n\nSecond paragraph."
      }
    ]
  }
}
```

Section components you can use (`__component` values):

- `sections.hero` — big title + optional subtitle + optional image
- `sections.text-block` — heading + body text + optional image
- `sections.image-text-split` — image on one side, text on the other
- `sections.full-bleed-image` — edge-to-edge photo
- `sections.image-pair` — two images side by side
- `sections.image-with-caption` — single image with a caption
- `sections.gallery` — grid of images
- `sections.numbered-list` — numbered steps
- `sections.anchor-band` — jump-nav bar for in-page anchors
- `sections.cta-banner` — call-to-action band with button
- `sections.testimonials` — reviews block
- `sections.card-grid` — grid of linked cards
- `sections.faq` — FAQ accordion
- `sections.team-grid` — team members grid
- `sections.contact-form` — enquiry form
- `sections.embed` — embed external HTML / iframe
- `sections.featured-products` — product carousel
- `sections.custom-html` — raw HTML block
- `sections.press-strip` — press logos
- `sections.pay-what-you-feel` — PWYF checkout block
- `sections.buy-programme` — programme purchase block

For the exact fields each section accepts, open the CMS, add that
section manually to any page, and look at which fields appear — the
field names in the admin UI are what you put in the JSON.

## Example files

In the `samples/` folder:
- `01-create-article.json` — write a new blog post
- `02-create-experience-with-image.json` — new retreat with hero photo
- `03-create-product-with-images.json` — new shop item with gallery
- `04-update-sort-order.json` — change display order
- `05-update-retreat-content.json` — change an existing retreat's copy
- `06-unpublish-old-retreat.json` — take an old retreat off the site
- `07-publish-draft.json` — publish something that was in draft
- `08-create-page-with-sections.json` — build a page from sections
