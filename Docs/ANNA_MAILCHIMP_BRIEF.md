# Hi Anna — Mailchimp next steps

The Stripe + Mailchimp wiring is live on staging. Every signup / purchase / RSVP will automatically tag the right contact in your Mailchimp audience. What's left is for you to build the **welcome email automations** in Mailchimp so those tags actually send emails.

## What's done for you

I've already created **13 email templates** in your Mailchimp account, one for each automation. You'll find them in **Mailchimp → Templates** with names like:

- `ALW J1A — Reset Letters Founding`
- `ALW J1B — Reset Letters Standard`
- `ALW J2 — Decoder Delivery`
- `ALW J3 — Workshops Confirmation`
- `ALW J4 — Discovery Call Booked`
- `ALW J5 — Returning Circle RSVP`
- `ALW J6 — Reset Room Member`
- `ALW J7 — The Reset (6-week)`
- `ALW J8 — Signal (12-week)`
- `ALW J9 — Signal & Build`
- `ALW J10 — One Day Intensive`
- `ALW J11 — Signal Collective`
- `ALW J12 — Reset Session 90-min`

Each template has:
- Your branding (header + footer + colours)
- `Hello *|FNAME|*,` greeting
- A placeholder paragraph to replace with your copy
- Your "Still Sparkling, Anna Lou x" signoff
- Footer with copyright + unsubscribe

## Your job — for each of the 13

In Mailchimp:

1. **Mailchimp → Automations → Customer Journeys → Create journey**
2. **Starting point:** "When a tag is added"
3. Pick the matching tag (e.g. for J7 use tag `The Reset (6-week)`)
4. Add an **Email** step
5. **Pick a template** → choose `ALW J7 — The Reset (6-week)` (the one matching the journey)
6. Edit the placeholder paragraph with your actual welcome copy (subjects + preheaders are suggested in the Mailchimp build spec doc I sent earlier)
7. **Turn the journey ON** when you're ready

That's it. The trigger fires automatically from the website — your only job is the writing.

## Priority order

Start with these (they fire most often):
1. **J1A — Reset Letters Founding** (already getting signups daily)
2. **J7 — The Reset (6-week)** (highest-value programme)
3. **J6 — Reset Room Member** (subscription welcome)

Then work through the rest at your own pace. Until each journey is ON, the tag still goes on the contact but no email goes out.

## Tag → Journey reference (paste into Mailchimp trigger config)

| Journey | Tag to listen for |
|---|---|
| J1A | Founding Members |
| J1B | Standard Subscribers |
| J2 | Decoder Downloaders |
| J3 | Workshop Buyers |
| J4 | Discovery Call Booked |
| J5 | Returning Circle RSVPs |
| J6 | Reset Room Members |
| J7 | The Reset (6-week) |
| J8 | Signal (12-week) |
| J9 | Signal & Build (founders) |
| J10 | One Day Intensive |
| J11 | Signal Collective |
| J12 | Reset Session (90-min) |

If you create a tag with a different name than what's listed here, just let Sameer know and he'll update the code.

## Anything missing?

If you want a journey for something not on this list (e.g. abandoned cart, post-workshop follow-up, birthday email) — just message and we'll wire it.
