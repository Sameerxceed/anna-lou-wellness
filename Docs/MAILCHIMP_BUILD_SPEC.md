# Mailchimp Build Spec — Anna Lou Wellness

**Goal:** Build all 12 Customer Journey shells in Mailchimp. Anna fills email content later.

**Source content:** `ALW_EMAIL_AUTOMATIONS_FINAL_Sameer.docx`

**Account:** Anna's Mailchimp (datacenter `us8`, Audience `AnnaLouWellness`, ID `8bcbe7b0d1`)

**Status of wiring:**
- ✅ Tags `Founding Members` and `Standard Subscribers` exist — auto-fire from `/reset-letters` form
- ⏳ Other 11 tags need creating + 10 of those 11 need backend wiring (Stripe webhooks, form APIs)

---

## Why we use Tags (not Segments or Groups)

In Mailchimp:
- **Tags** = simple labels you attach via API or manually. Best for journey triggers.
- **Segments** = saved filter queries (e.g. "subscribers with tag X and opened email Y in last 30 days"). Not what we need.
- **Groups** = subscriber-managed preferences (e.g. "Interested in: Workshops"). Subscriber-facing, not for backend triggers.

We're using **Tags** for everything. Each tag = one Customer Journey trigger.

---

## Step 1 — Create 11 more tags (in addition to the 2 that exist)

Mailchimp → **Audience → Tags → Create Tag** — make each one:

| # | Tag name | Purpose |
|---|---|---|
| 1 | `Founding Members` | ✅ exists |
| 2 | `Standard Subscribers` | ✅ exists |
| 3 | `Decoder Downloaders` | Free Nervous System Decoder opt-in |
| 4 | `Workshop Buyers` | Anyone who buys a workshop (£15 or £200) |
| 5 | `Discovery Call Booked` | Booked a free 20-min call |
| 6 | `Returning Circle RSVPs` | RSVP'd to a weekly Circle |
| 7 | `Reset Room Members` | £25/mo subscribers |
| 8 | `The Reset (6-week)` | Booked The Reset programme |
| 9 | `Signal (12-week)` | Booked Signal |
| 10 | `Signal & Build (founders)` | Booked Signal & Build |
| 11 | `One Day Intensive` | Booked One Day |
| 12 | `Signal Collective` | Joined mastermind |
| 13 | `Reset Session (90-min)` | Booked single 1:1 session |

Type each name **exactly as above** — the code matches tag names as strings, so a typo breaks the wiring.

---

## Step 2 — Build 12 Customer Journeys

For each: **Mailchimp → Automations → Customer Journeys → Create journey → Start from scratch**

General pattern for every journey:
1. **Starting point** → "When a tag is added" → pick the tag
2. **Action**: Send email (compose or use a placeholder draft)
3. (Optional) **Delay** → wait N days/hours
4. (Optional) Another Send email
5. **Turn on** the journey when content is final (leave OFF for now if drafts)

---

### Journey 1A — Reset Letters Founding Welcome

- **Name:** `Reset Letters - Founding Welcome`
- **Trigger tag:** `Founding Members`
- **Emails:** 1
  - **Email 1A.1** — immediately on tag add
    - Subject: `Welcome, Founding Member.`
    - Preheader: `You're in. Forever. No charge, ever.`
    - Content: "you're in, you're a Founding Member for life, first edition lands 22 June"

---

### Journey 1B — Reset Letters Standard Welcome

- **Name:** `Reset Letters - Standard Welcome`
- **Trigger tag:** `Standard Subscribers`
- **Emails:** 1
  - **Email 1B.1** — immediately
    - Subject: `You're in. Here's what to expect.`
    - Preheader: `A short letter, a quiet welcome, and where to start.`

---

### Journey 2 — Decoder Delivery

- **Name:** `Decoder - Free Download`
- **Trigger tag:** `Decoder Downloaders`
- **Emails:** 2
  - **Email 2.1** — immediately
    - Subject: `Your Nervous System Decoder is here.`
    - Preheader: `Seven questions. A quiet half hour. The signal coming back online.`
    - Content: PDF download link + 1-paragraph intro
  - **Wait 3 days**
  - **Email 2.2** — follow-up
    - Subject: `How did the Decoder land?`
    - Preheader: `A note, a question, and one small next step if you want it.`

---

### Journey 3 — Workshops (Confirmation + Follow-up)

- **Name:** `Workshops - Confirmation & Follow-up`
- **Trigger tag:** `Workshop Buyers`
- **Emails:** 2
  - **Email 3.1** — immediately
    - Subject: `You're booked for [workshop name]`
    - Preheader: `Date, link, and what to expect on the day.`
    - Note: use Mailchimp merge tag for workshop name if Anna captures it as a custom field
  - **Wait 1 day after workshop end** (Anna sets this per workshop, OR use a "Wait 7 days" default and trust the buying-week pattern)
  - **Email 3.2** — post-workshop
    - Subject: `Yesterday's workshop, and what comes next`
    - Preheader: `Replay, written companion, and the optional next step.`

---

### Journey 4 — Discovery Call Confirmation

- **Name:** `Discovery Call - Booked`
- **Trigger tag:** `Discovery Call Booked`
- **Emails:** 1
  - **Email 4.1** — immediately
    - Subject: `Your discovery call is booked`
    - Preheader: `What to expect and a few words before we meet.`

---

### Journey 5 — Returning Circle RSVP

- **Name:** `Returning Circle - RSVP Confirmation`
- **Trigger tag:** `Returning Circle RSVPs`
- **Emails:** 1
  - **Email 5.1** — immediately
    - Subject: `You're in for this week's Circle`
    - Preheader: `Link, time, and one small thing to bring.`

---

### Journey 6 — Reset Room Member Onboarding

- **Name:** `Reset Room - Member Onboarding`
- **Trigger tag:** `Reset Room Members`
- **Emails:** 3
  - **Email 6.1** — immediately
    - Subject: `Welcome to The Reset Room`
  - **Wait 2 days**
  - **Email 6.2** — where to start
    - Subject: `Where to start in the Reset Room`
  - **Wait 5 days**
  - **Email 6.3** — end of first week
    - Subject: `One week in. How is it landing?`

---

### Journey 7 — The Reset (6-week 1:1)

- **Name:** `The Reset - Programme Onboarding`
- **Trigger tag:** `The Reset (6-week)`
- **Emails:** 2
  - **Email 7.1** — immediately
    - Subject: `Welcome to The Reset`
  - **Wait 6 days** (default; Anna can adjust per cohort)
  - **Email 7.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Journey 8 — Signal (12-week)

- **Name:** `Signal - Programme Onboarding`
- **Trigger tag:** `Signal (12-week)`
- **Emails:** 2
  - **Email 8.1** — immediately
    - Subject: `Welcome to Signal`
  - **Wait 6 days**
  - **Email 8.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Journey 9 — Signal & Build (founders)

- **Name:** `Signal & Build - Founder Onboarding`
- **Trigger tag:** `Signal & Build (founders)`
- **Emails:** 2
  - **Email 9.1** — immediately
    - Subject: `Welcome to Signal & Build`
  - **Wait 6 days**
  - **Email 9.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Journey 10 — One Day Intensive

- **Name:** `One Day - Intensive Onboarding`
- **Trigger tag:** `One Day Intensive`
- **Emails:** 3
  - **Email 10.1** — immediately
    - Subject: `Your One Day is confirmed`
  - **Wait 7 days** (default — assume booking ~1 week before)
  - **Email 10.2** — day before
    - Subject: `Tomorrow. What to bring, what not to.`
  - **Wait 2 days** (= 1 day after the One Day)
  - **Email 10.3** — integration
    - Subject: `Integration: the week after your One Day`

---

### Journey 11 — Signal Collective Mastermind

- **Name:** `Signal Collective - Mastermind Onboarding`
- **Trigger tag:** `Signal Collective`
- **Emails:** 2
  - **Email 11.1** — immediately
    - Subject: `Welcome to the Collective`
  - **Wait 3 days**
  - **Email 11.2** — meet the room
    - Subject: `Meet the room`

---

### Journey 12 — Reset Session (90-min single)

- **Name:** `Reset Session - 90min Booking`
- **Trigger tag:** `Reset Session (90-min)`
- **Emails:** 2
  - **Email 12.1** — immediately
    - Subject: `Your Reset Session is booked`
  - **Wait 6 days**
  - **Email 12.2** — day before
    - Subject: `Tomorrow. A few words before we sit together.`

> **Variants** for Reset Sessions: three sub-flavours (Founder Reset / Dating Reset / Nervous System Reset). Two options:
> - **Simple:** one generic email, capture the variant in a merge field (Mailchimp custom field) and reference it in the email body via merge tag like `*|VARIANT|*`
> - **Granular:** create 3 sub-tags (`Reset Session - Founder`, `Reset Session - Dating`, `Reset Session - NS`) and 3 separate journeys
>
> Default to simple for now. Switch to granular only if Anna wants different content per variant.

---

## Step 3 — Per-journey setup checklist

For each of the 12 journeys, repeat:

1. ☐ Customer Journeys → **Create journey** → "Start from scratch"
2. ☐ Name the journey per spec above
3. ☐ Choose starting point → "When a tag is added" → pick tag
4. ☐ Add **Send email** → name email per spec (placeholder content for now)
5. ☐ If multi-step: add **Wait** step → set days
6. ☐ Add next Send email → name it
7. ☐ Repeat for all emails in sequence
8. ☐ Leave each email as **Draft** (don't activate journey yet) — Anna fills content later
9. ☐ Save the journey

**Time estimate:** ~10 min per journey shell × 12 = **2 hours total**.

---

## Step 4 — Backend wiring status (dev side)

**Right now only Journeys 1A and 1B fire automatically.** Everything else needs the listed trigger source to be built and wired to the Mailchimp tag API.

| Journey | Trigger source | Wired? |
|---|---|---|
| 1A — Founding | `/reset-letters` form (pre-22-June) | ✅ done |
| 1B — Standard | `/reset-letters` form (post-22-June) | ✅ done — fires automatically after launch date |
| 2 — Decoder | `/free/nervous-system-decoder` form | ⏳ needs API route |
| 3 — Workshops | Stripe webhook (workshop product purchase) | ⏳ needs Stripe + webhook |
| 4 — Discovery | Calendly webhook OR form on `/the-work/discovery` | ⏳ needs route or Calendly integration |
| 5 — Returning Circle | RSVP form on `/community/returning-circle` | ⏳ needs API route |
| 6 — Reset Room | Stripe subscription webhook (£25/mo) | ⏳ blocked on Stripe keys |
| 7 — The Reset (6wk) | Stripe webhook (programme purchase) | ⏳ blocked on Stripe keys |
| 8 — Signal (12wk) | Stripe webhook | ⏳ blocked on Stripe keys |
| 9 — Signal & Build | Stripe webhook | ⏳ blocked on Stripe keys |
| 10 — One Day | Stripe webhook | ⏳ blocked on Stripe keys |
| 11 — Signal Collective | Stripe webhook | ⏳ blocked on Stripe keys |
| 12 — Reset Session | Stripe webhook | ⏳ blocked on Stripe keys |

**Approach:** Build the Mailchimp journey shells now. As each form/Stripe webhook gets wired (Phase 2B-E), the corresponding journey auto-activates because the API will start adding the tag.

---

## How tags get attached (technical reference for the dev)

The `subscribe-reset-letters` route does this for the two Reset Letters tags:

```typescript
// 1. Upsert subscriber
PUT https://us8.api.mailchimp.com/3.0/lists/8bcbe7b0d1/members/{md5(email)}
Body: { email_address, status_if_new: 'subscribed', merge_fields: { FNAME } }

// 2. Attach tag (separate call)
POST https://us8.api.mailchimp.com/3.0/lists/8bcbe7b0d1/members/{md5(email)}/tags
Body: { tags: [{ name: 'Founding Members', status: 'active' }] }
```

Auth: HTTP Basic with `'any:<MAILCHIMP_API_KEY>'` base64-encoded.

When wiring future endpoints, use the same pattern with a different tag name.

---

## Handoff to Anna

Once shells are built, send Anna:

> "Hi Anna — I've set up the 12 journey shells in Mailchimp. Each one has the tag trigger wired and the email placeholders named. All you need to do is open each draft email, paste the copy from the email automations doc (matching subject lines), design the visual, and turn the journey ON. No setup needed on your side — just content + design. Let me know when you've finished 1A and I'll show you 1B."
