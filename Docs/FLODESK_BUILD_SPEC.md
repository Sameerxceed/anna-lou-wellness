# Flodesk Build Spec — Anna Lou Wellness

**Goal:** Build all 12 workflow shells in Flodesk. Anna fills email content later.

**Source:** ALW_EMAIL_AUTOMATIONS_FINAL_Sameer.docx

---

## Step 1 — Create segments first

Before any workflows, create these segments in Flodesk (Audience → Segments → New):

| # | Segment name | Purpose |
|---|---|---|
| 1 | `Reset Letters - Founding Members` | ✅ already exists |
| 2 | `Reset Letters - Standard` | ✅ already exists |
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

---

## Step 2 — Build 12 workflows (in order)

For each: **Workflows → Create → Start from scratch → Trigger: "Is added to segment"**

---

### Workflow 1 — Reset Letters Welcome (Free)

- **Name:** `Reset Letters - Standard Welcome`
- **Trigger segment:** `Reset Letters - Standard`
- **Emails:** 1
  - **Email 1.1** — immediately on add
    - Subject: `You're in. Here's what to expect.`
    - Preheader: `A short letter, a quiet welcome, and where to start.`

> **Note:** Sequence 1A (Founding Welcome) is the workflow you already started today.

---

### Workflow 2 — Decoder Delivery

- **Name:** `Decoder - Free Download`
- **Trigger segment:** `Decoder Downloaders`
- **Emails:** 2
  - **Email 2.1** — immediately
    - Subject: `Your Nervous System Decoder is here.`
    - Preheader: `Seven questions. A quiet half hour. The signal coming back online.`
  - **Wait 3 days**
  - **Email 2.2** — follow-up
    - Subject: `How did the Decoder land?`
    - Preheader: `A note, a question, and one small next step if you want it.`

---

### Workflow 3 — Post-Workshop

- **Name:** `Workshops - Confirmation & Follow-up`
- **Trigger segment:** `Workshop Buyers`
- **Emails:** 2
  - **Email 3.1** — immediately
    - Subject: `You're booked for [workshop name]`
    - Preheader: `Date, link, and what to expect on the day.`
  - **Wait until 24h after workshop end** (Anna sets per workshop)
  - **Email 3.2** — post-workshop
    - Subject: `Yesterday's workshop, and what comes next`
    - Preheader: `Replay, written companion, and the optional next step.`

---

### Workflow 4 — Discovery Call Confirmation

- **Name:** `Discovery Call - Booked`
- **Trigger segment:** `Discovery Call Booked`
- **Emails:** 1
  - **Email 4.1** — immediately
    - Subject: `Your discovery call is booked`
    - Preheader: `What to expect and a few words before we meet.`

---

### Workflow 5 — Returning Circle RSVP

- **Name:** `Returning Circle - RSVP Confirmation`
- **Trigger segment:** `Returning Circle RSVPs`
- **Emails:** 1
  - **Email 5.1** — immediately
    - Subject: `You're in for this week's Circle`
    - Preheader: `Link, time, and one small thing to bring.`

---

### Workflow 6 — Reset Room Membership Welcome

- **Name:** `Reset Room - Member Onboarding`
- **Trigger segment:** `Reset Room Members`
- **Emails:** 3
  - **Email 6.1** — immediately
    - Subject: `Welcome to The Reset Room`
  - **Wait 2 days**
  - **Email 6.2** — where to start
    - Subject: `Where to start in the Reset Room`
  - **Wait 5 days** (so total ~7 days from signup)
  - **Email 6.3** — end of first week
    - Subject: `One week in. How is it landing?`

---

### Workflow 7 — The Reset (6-week 1:1)

- **Name:** `The Reset - Programme Onboarding`
- **Trigger segment:** `The Reset (6-week)`
- **Emails:** 2
  - **Email 7.1** — immediately
    - Subject: `Welcome to The Reset`
  - **Wait until 1 day before first session** (Anna sets manually per client OR use "Wait 6 days" as default)
  - **Email 7.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Workflow 8 — Signal (12-week)

- **Name:** `Signal - Programme Onboarding`
- **Trigger segment:** `Signal (12-week)`
- **Emails:** 2
  - **Email 8.1** — immediately
    - Subject: `Welcome to Signal`
  - **Wait 6 days** (default; Anna adjusts per client)
  - **Email 8.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Workflow 9 — Signal & Build (founders)

- **Name:** `Signal & Build - Founder Onboarding`
- **Trigger segment:** `Signal & Build (founders)`
- **Emails:** 2
  - **Email 9.1** — immediately
    - Subject: `Welcome to Signal & Build`
  - **Wait 6 days**
  - **Email 9.2** — day before first session
    - Subject: `Tomorrow. A few words before we begin.`

---

### Workflow 10 — One Day Intensive

- **Name:** `One Day - Intensive Onboarding`
- **Trigger segment:** `One Day Intensive`
- **Emails:** 3
  - **Email 10.1** — immediately
    - Subject: `Your One Day is confirmed`
  - **Wait until day before** (default: based on Anna's scheduling — try 7 days)
  - **Email 10.2** — day before
    - Subject: `Tomorrow. What to bring, what not to.`
  - **Wait 2 days** (so 1 day after the One Day)
  - **Email 10.3** — integration
    - Subject: `Integration: the week after your One Day`

---

### Workflow 11 — Signal Collective Mastermind

- **Name:** `Signal Collective - Mastermind Onboarding`
- **Trigger segment:** `Signal Collective`
- **Emails:** 2
  - **Email 11.1** — immediately
    - Subject: `Welcome to the Collective`
  - **Wait 3 days**
  - **Email 11.2** — meet the room
    - Subject: `Meet the room`

---

### Workflow 12 — Reset Session (90-min single)

- **Name:** `Reset Session - 90min Booking`
- **Trigger segment:** `Reset Session (90-min)`
- **Emails:** 2
  - **Email 12.1** — immediately
    - Subject: `Your Reset Session is booked`
  - **Wait until day before** (default 6 days)
  - **Email 12.2** — day before
    - Subject: `Tomorrow. A few words before we sit together.`

> **Variants:** Three sub-flavours (Founder Reset / Dating Reset / Nervous System Reset). Anna can either create 3 sub-segments or send one generic email and have her form capture the variant in a custom field.

---

## Step 3 — Per-workflow setup checklist

For **each** of the 12 workflows, repeat:

1. ☐ Workflows → Create → "Start from scratch"
2. ☐ Name workflow per spec above
3. ☐ Click "Choose trigger" → "Is added to segment" → pick segment
4. ☐ Click "+" → add **Email** action → name email per spec (placeholder for now)
5. ☐ If multi-step: add **Delay** action → set days
6. ☐ Add next Email action → name it
7. ☐ Repeat for all emails in sequence
8. ☐ Leave each email as **Draft** (don't publish) — Anna fills content later
9. ☐ Save workflow

**Time estimate:** ~10 min per workflow shell × 12 = **2 hours total**.

---

## Step 4 — Critical caveat (dev side)

**Right now only Workflow 1 (Reset Letters) is wired to auto-fire.**

The remaining 11 segments need backend wiring to actually add subscribers:

| Workflow | Trigger source | Wired? |
|---|---|---|
| 1 | Reset Letters signup form | ✅ done |
| 2 | `/free/nervous-system-decoder` form | ⏳ needs API route |
| 3 | Stripe webhook (workshop purchase) | ⏳ Stripe not built yet |
| 4 | Calendly webhook OR form on `/the-work/discovery` | ⏳ |
| 5 | RSVP form on `/community/returning-circle` | ⏳ |
| 6 | Stripe webhook (Reset Room subscription) | ⏳ |
| 7-12 | Stripe webhook (programme purchase) | ⏳ Stripe not built yet |

**Approach:** Build the Flodesk shells now. As each form/Stripe webhook gets wired (Phase 2), the workflows auto-activate.

---

## Handoff to Anna

Once shells are built, send Anna:

> "Hi Anna — I've set up the 12 workflow shells in Flodesk. Each one has the segment trigger wired and the email placeholders named. All you need to do is open each draft email, paste the copy from the email automations doc (matching subject lines), design the visual, and save. No setup needed on your side — just content + design. Let me know when you've finished 1A and I'll show you 1B."
