# Anna's CMS Guide — Navigation editor & Live Preview

Two new things in Strapi after this deploy.

## 1. You can now edit the whole site menu yourself

In the Strapi sidebar, open **Content Manager → Navigation**.

You'll see every top-level menu item (Reset Stories, Life, Love & Relationships, etc.) and inside each one, the dropdown sub-items.

**To add a top-level item:** scroll to the bottom of the Items list → click "Add an entry to Items" → choose "Top-Level Menu Item". Fill in label (what shows on the menu), href (the page it links to, e.g. `/about`), and optional colour hex (e.g. `#6E3A5A`).

**To add a dropdown sub-item:** open the parent menu item → scroll to its Children list → "Add an entry to Children" → fill in label + href.

**To reorder:** drag the items by the handle on the left.

**To remove:** click the trash icon on the right of any item.

**Top strip text** (the small line of text across the very top of every page) is in the same Navigation screen — edit it like a normal text field. Use middle dots `·` between words.

When you save, the menu updates on the live site within a minute.

---

## 2. Live preview while editing any page

In any page you edit (homepage, articles, products, programme pages, etc.), you'll see a new **Preview** button at the top right.

Click it → a side-by-side preview opens showing the actual live page with your draft changes. As you edit fields on the left, the page on the right updates.

This means you no longer have to save → switch tabs → reload the live site to see what changed. You see it as you type.

**Note for now:** the preview shows the *currently published* version of related content. So if you change an article body in the preview iframe shows your live draft fine, but related modules (like a reference to another article) show their published state. If you need to preview unpublished items, save them as published first.

---

## Tips

- The menu is the source of truth — if you remove "Educational" or "Weekend" from the Life dropdown in Navigation, it disappears from the live menu. (You don't have to delete the underlying category page, just the menu entry.)
- Anna's existing Reset Letters / Welcome / Reset Room edits all still work the same. This adds preview on top, doesn't change how editing works.
- If the preview shows a 401 / blank screen: the `PREVIEW_SECRET` env var got out of sync between Strapi and the website. Ping Sameer.
