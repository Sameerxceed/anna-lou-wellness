# Hi Anna — Mailchimp is ready for you

The Stripe + Mailchimp wiring is live on staging. Every signup / purchase / RSVP from the website will automatically tag the right contact in your audience.

## What I've set up for you

### 1. A master email template — `ALW Master`
In Mailchimp → **Email Templates → Saved templates** you'll see `ALW Master`. It has:
- The Anna Lou Wellness wordmark at the top
- `Hello *|FNAME|*,` greeting (auto-fills the contact's first name)
- A placeholder paragraph in the middle for you to replace with each email's actual copy
- "Still Sparkling, Anna Lou x" signoff
- Branded footer + unsubscribe link

You don't need to touch this template. Every journey email already uses it.

### 2. Thirteen Customer Journey drafts
In Mailchimp → **Automations → Customer Journeys** you'll see 13 drafts:

| Journey name | Triggered when… |
|---|---|
| Reset Letters - Founding Welcome | Someone signs up as a Founding Member |
| Reset Letters - Standard Welcome | Someone signs up after launch (post 22 June) |
| Decoder - Free Download | Someone downloads the free Nervous System Decoder |
| Workshops - Confirmation | Someone buys any workshop |
| Discovery Call - Booked | Someone books a free discovery call |
| Returning Circle - RSVP | Someone RSVPs to a weekly Circle |
| Reset Room - Member Onboarding | Someone subscribes (£25/month) |
| The Reset - Programme Onboarding | Someone books The Reset (6-week) |
| Signal - Programme Onboarding | Someone books Signal (12-week) |
| Signal & Build - Founder Onboarding | Someone books Signal & Build |
| One Day - Intensive Onboarding | Someone books a One Day Intensive |
| Signal Collective - Mastermind | Someone joins the Collective |
| Reset Session - 90min Booking | Someone books a 90-min session |

Each one already has:
- The trigger wired (the right tag)
- The subject line and preview text set
- The ALW Master template attached

## Your job

For each of the 13 journeys:

1. Click the journey in the list
2. Click on the **Send email** step
3. Click **Edit Email Content** (or **Design Email**)
4. The ALW Master template loads with brand header/footer already there
5. **Replace the middle placeholder paragraph** with the actual welcome copy you want to send
6. Save the email
7. Back on the canvas, click **Continue** at the top → **Turn flow on** (when you're ready to go live)

The journey starts firing as soon as you turn it on. Until then it stays paused.

## Priority order

Start with these — they fire most often:

1. **Reset Letters - Founding Welcome** (daily signups happening already)
2. **Reset Room - Member Onboarding** (subscription welcome)
3. **The Reset - Programme Onboarding** (highest-value programme)

Then work through the rest at your own pace. Until each is turned ON, the tag still gets applied to the contact but no email goes out.

## A few notes

- **Dynamic content** (like workshop dates or Zoom links): we haven't wired this yet. Right now your emails will go to everyone with the same body. If you need any line to vary per recipient (workshop date, programme start date, session Zoom link), tell Sameer which fields and he'll add them as merge tags.
- **From name** is currently `AnnaLouWellness` (your audience name). You can change it to just `Anna Lou` in each email's "To & From" section if you prefer.
- **Default Mailchimp From email** is `anna@annalouoflondon.com`. If you'd rather these come from `hello@annalouwellness.com`, update it in Mailchimp → Audience → Settings → Defaults.

## If something doesn't fire

If you turn a journey ON and emails aren't sending:
- Check the journey status is "Active" (not Draft or Paused)
- Confirm the trigger tag exists in your audience (Audience → Tags)
- Send Sameer a screenshot — most issues are 5-min fixes
