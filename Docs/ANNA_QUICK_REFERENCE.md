# Anna Lou Wellness — Quick Reference

**The 10 most common tasks. Keep this open while you work. Full detail in `ANNA_USER_MANUAL.docx`.**

Log in: `cms.annalouwellness.com/admin`

---

## 1. Publish a new Reset Story (or any article)

Content Manager → **Story · Article** → **Create new entry**
→ Title, Slug, Excerpt, Body, Hero image, Category (REQUIRED — picks the section), Author, Reading time
→ Toggle **Is free** if it's not paywalled
→ **Save & Publish**

Live within 1 minute.

---

## 2. Edit an article body

Content Manager → **Story · Article** → click row
→ Edit fields → **Preview** (top right) to check → **Save & Publish**

---

## 3. Add a new product to the shop

Content Manager → **Shop · Product** → **Create new entry**
→ Name, Slug, Short description, Description, Price (number only), Stock (integer), Is active = ON, Images (drag first one as main), Category
→ **Save & Publish**

---

## 4. Mark an order as shipped

Content Manager → **Shop · Order** → click the order
→ **Status** = `shipped`
→ Add tracking number to **Notes**
→ **Save**

---

## 5. Edit homepage hero text

Content Manager → Single Types → **Homepage**
→ Scroll to Hero section → edit Title, Body, CTA labels/URLs
→ **Preview** to check → **Save & Publish**

---

## 6. Change a menu item (rename / add / remove)

Content Manager → Single Types → **Navigation**
→ Click the menu item → edit label/href/colour
→ For sub-menu: scroll to its **children** → add/remove/rename
→ To reorder: drag handles → **Save**

---

## 7. Activate a Mailchimp email journey

`mailchimp.com` → **Automations → Customer Journeys**
→ Click the journey → top right **Start**

⚠️ Only after: website is live at annalouwellness.com, real URLs in the email (not placeholders), Stripe is in Live mode.

---

## 8. Find a Stripe payment

`dashboard.stripe.com` → search bar (top) → paste customer email OR Stripe Payment ID from the order

To refund: open the payment → **Refund** button → confirm. Then in Strapi mark order status `refunded`.

---

## 9. Upload an image

Sidebar → **Media Library** → drag-and-drop the file (or click Add new assets)

OR upload directly when editing any page: click any image field → "Add an asset" → drag-and-drop.

Max 10 MB. JPG/PNG/WebP/SVG. iPhone photos auto-rotate correctly.

---

## 10. Toggle a programme on/off temporarily

Content Manager → **Work · Programme** → click the programme
→ Toggle **Is active** OFF (hides it)
→ **Save**

Same for any single coaching session, experience, or product. The data stays — you just hide it from the public site. Toggle ON to show again.

---

## When something breaks

1. Hard-refresh: **Ctrl+Shift+R** (Windows) / **Cmd+Shift+R** (Mac)
2. Wait 60 seconds (cache), try again
3. Still broken? **WhatsApp Sameer** with a screenshot

## Pre-launch (one-time)

Before flipping the site to live, all 3 must be done:
1. Website live at `annalouwellness.com` (Sameer — DNS cutover)
2. Stripe in Live mode (Sameer — env var swap)
3. All 9 button URLs filled in Mailchimp emails (you — gather + paste)

Then activate journeys in this order (test each before next): 1A → 1B → Decoder → Discovery → Returning Circle → Workshops → Sessions → Programmes.

---

*Anna x*
