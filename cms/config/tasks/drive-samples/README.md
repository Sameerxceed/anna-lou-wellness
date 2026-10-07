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

Common errors:
- `type must be one of ...` — typo in the `type` field
- `No X found with slug "Y"` — slug doesn't exist (check spelling)
- `Image "Z.jpg" not found in Drive images folder` — image missing or
  typo in filename
- `slug must be a string type, but the final value was: null` —
  create missing a title/name AND no slug

## Example files

In the `samples/` folder:
- `01-create-article.json` — write a new blog post
- `02-create-experience-with-image.json` — new retreat with hero photo
- `03-create-product-with-images.json` — new shop item with gallery
- `04-update-sort-order.json` — change display order
- `05-update-retreat-content.json` — change an existing retreat's copy
- `06-unpublish-old-retreat.json` — take an old retreat off the site
- `07-publish-draft.json` — publish something that was in draft
