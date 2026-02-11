# Moshi — Pivot Plan: Personal AI Concierge for Life Abroad

> From "restaurant booking tool" to "your AI agent that handles life admin in any country."

---

## 1. THE VISION

You're living in Tokyo. You don't speak Japanese. Your apartment has a water leak, you need to see a doctor, your internet bill looks wrong, and you need to enroll your kid in school.

Each of these requires a phone call. In Japanese. During business hours. With specific vocabulary you don't know.

**Moshi is your personal agent.** You create a task — "call my landlord about the leak in the bathroom" — and Moshi handles it. It calls, speaks the language, navigates the conversation, and reports back with what happened, what was agreed, and what you need to do next.

It's not a translation app. It's not a phrasebook. It's an agent that **does the thing for you**.

---

## 2. THE PRODUCT: TASK-BASED CONCIERGE

### Core concept: Tasks, not forms

The user doesn't fill out a booking form. They **create a task**. A task is anything that requires contacting a business or person.

```
┌─────────────────────────────────────────────────┐
│  What do you need done?                         │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ Call my landlord and tell them the hot     │  │
│  │ water stopped working in the bathroom     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Phone number: +81 3-1234-5678                  │
│                                                 │
│  Priority: [Normal] [Urgent]                    │
│                                                 │
│  [Create Task →]                                │
└─────────────────────────────────────────────────┘
```

That's it. One text box, one phone number, one button. Moshi figures out the rest.

### What Moshi does with the task

1. **Understands the intent** — GPT parses the request, identifies the goal, anticipates likely questions
2. **Prepares a call plan** — what to say, what to ask, what outcomes to push for
3. **Makes the call** — in the local language, with cultural awareness
4. **Reports back** — full transcript, summary, action items, next steps

### The task lifecycle

```
Created → Preparing → Calling → Completed / Needs Follow-up / Failed

┌─────────────────────────────────────────────────┐
│  ✅ Landlord — Hot water issue                  │
│  Called 2:34 PM · 4 min 12 sec                  │
│                                                 │
│  Summary:                                       │
│  Spoke with Tanaka-san at the management        │
│  company. They will send a plumber tomorrow      │
│  between 10am-12pm. You need to be home.        │
│  Reference number: #4521.                       │
│                                                 │
│  Action items:                                  │
│  • Be home tomorrow 10am-12pm                   │
│  • If plumber doesn't come, call back with      │
│    reference #4521                              │
│                                                 │
│  [View transcript] [Create follow-up task]      │
└─────────────────────────────────────────────────┘
```

---

## 3. TASK CATEGORIES (NOT FORMS)

We don't need a separate form for every type of task. Instead, Moshi uses **smart categorization** to enhance the call:

### Life Admin
- Landlord / property management
- Utilities (gas, electric, water, internet)
- Bank / financial services
- Insurance
- Government / city hall
- Post office / delivery

### Health
- Doctor / clinic appointments
- Dentist
- Hospital inquiries
- Pharmacy questions
- Insurance claims

### Family
- School enrollment / inquiries
- Daycare / nursery
- After-school activities
- Parent-teacher communication

### Services
- Restaurant reservations
- Haircut / salon appointments
- Gym / fitness
- Cleaning services
- Car maintenance / repair

### Travel
- Hotel requests
- Airline inquiries
- Train / bus reservations
- Tour bookings

### Custom
- Anything else — just describe it

**The user never picks a category.** They just describe what they need. Moshi auto-categorizes and adjusts its approach accordingly. A call to a landlord is different from a call to a restaurant — different tone, different questions to anticipate, different follow-up needed.

---

## 4. THE DASHBOARD: YOUR TASK BOARD

The main screen is a **task board**, not a call history. It shows your active life admin at a glance:

```
┌─────────────────────────────────────────────────┐
│  moshi                          Tokyo, Japan 🇯🇵 │
│                                                 │
│  Good afternoon, Alex.                          │
│  You have 2 tasks in progress.                  │
│                                                 │
│  ┌─ ACTIVE ─────────────────────────────────┐   │
│  │                                          │   │
│  │  🔄 Internet bill dispute                │   │
│  │     Calling NTT... 1:23 elapsed          │   │
│  │                                          │   │
│  │  ⏳ Doctor appointment                    │   │
│  │     Queued · will call after NTT          │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ COMPLETED TODAY ────────────────────────┐   │
│  │                                          │   │
│  │  ✅ Landlord — plumber coming tomorrow   │   │
│  │     10am-12pm · ref #4521                │   │
│  │                                          │   │
│  │  ✅ Restaurant — booked Fri 7pm, 2 pax   │   │
│  │     Sushi Saito · counter seats          │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ NEEDS ATTENTION ────────────────────────┐   │
│  │                                          │   │
│  │  ⚠️ Bank — they need you to visit        │   │
│  │     Bring passport + residence card      │   │
│  │     Nearest branch: Shibuya, 9am-3pm     │   │
│  │     [Create reminder] [Dismiss]          │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  [+ New Task]                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Key UX principles

1. **Task board, not call log** — the user cares about outcomes, not calls
2. **Action items are first-class** — "you need to be home tomorrow 10-12" is more important than the transcript
3. **Needs Attention** — tasks where the outcome requires user action (visit in person, provide documents, etc.)
4. **Follow-up tasks** — one-tap to create a follow-up from a completed task
5. **No clutter** — completed tasks fade after 7 days unless pinned

---

## 5. SMART TASK CREATION

### Method 1: Free text (primary)
```
"Call NTT and ask why my internet bill is ¥8,000 this month when it's usually ¥5,000"
```

Moshi parses this and knows:
- Who: NTT (internet provider)
- What: billing dispute
- Context: expects ¥5,000, got ¥8,000
- Goal: understand the charge, get it corrected if wrong
- Tone: firm but polite

### Method 2: Quick templates (shortcuts)
For common tasks, offer one-tap templates:

```
Quick tasks:
📞 Call about a bill          🏥 Book a doctor
🔧 Report a maintenance issue 💇 Book an appointment
📦 Track a delivery           🍽 Book a restaurant
```

Each template pre-fills a prompt:
- "Call about a bill" → "Call [company] about my bill. My account number is [___]. The issue is [___]."

### Method 3: Photo-to-task
User takes a photo of a letter, bill, or notice they received (in Japanese/Korean/etc.). Moshi:
1. OCR + translates the document
2. Identifies what it is (bill, notice, appointment reminder, etc.)
3. Suggests a task: "This is a notice from Tokyo Gas about a meter reading. Want me to call them to schedule?"

**This is incredibly powerful for expats** who receive mail they can't read.

### Method 4: Recurring tasks
- "Call the clinic every month to refill my prescription"
- "Check with the landlord about the plumber follow-up in 3 days"

---

## 6. THE AI AGENT: HOW IT HANDLES DIFFERENT CALLS

### Restaurant booking (what we have now)
```
Goal: Secure a reservation
Approach: Direct, efficient
Questions to anticipate: date, time, party size, name, allergies
Success criteria: Confirmed booking with details
```

### Landlord / maintenance
```
Goal: Report issue, get resolution timeline
Approach: Clear description of problem, push for specific timeline
Questions to anticipate: apartment number, tenant name, when did it start, is it urgent
Success criteria: Repair scheduled with date/time, reference number obtained
Follow-up: Remind user of appointment, create follow-up task if not resolved
```

### Medical appointment
```
Goal: Book appointment
Approach: Polite, provide necessary info
Questions to anticipate: first visit?, symptoms, insurance, preferred date
Success criteria: Appointment confirmed with date/time/doctor
Sensitivity: Don't share unnecessary medical details
Follow-up: Reminder before appointment, "bring these documents" list
```

### Billing dispute
```
Goal: Understand charge, get correction if warranted
Approach: Firm but polite, reference specific amounts
Questions to anticipate: account number, billing period, payment history
Success criteria: Explanation obtained OR credit/adjustment applied
Follow-up: "Check next bill to confirm adjustment"
```

### Government / bureaucracy
```
Goal: Get information or schedule appointment
Approach: Very polite, patient (government offices are slow)
Questions to anticipate: residence card number, address, purpose of visit
Success criteria: Clear answer obtained OR appointment scheduled
Follow-up: "Bring these documents" checklist
```

Each category has a **system prompt template** that shapes the AI's behavior. The AI doesn't just translate — it knows how to navigate each type of conversation.

---

## 7. PRICING MODEL

### Free tier
- 3 tasks/month
- Basic call types (restaurant, appointment booking)
- 48-hour task queue (not instant)

### Personal — $19/month
- 15 tasks/month
- All call types including life admin
- Priority queue (tasks start within minutes)
- Photo-to-task (document scanning)
- Action item reminders

### Unlimited — $39/month
- Unlimited tasks
- Everything in Personal
- Recurring tasks
- Multi-person household (add family members)
- Priority support

### Pay-as-you-go
- $3/task for simple calls (booking, inquiry)
- $5/task for complex calls (disputes, negotiations, multi-step)

### Why this works financially
- Cost per call: ~$0.30-0.80 (Twilio + GPT-4o)
- At $19/month for 15 tasks: $1.27/task revenue vs ~$0.50 cost = healthy margin
- At $39/month unlimited: most users do 8-12 tasks/month = still profitable
- The heavy users (20+ tasks) are rare and they're your best advocates

---

## 8. TARGET MARKET & SIZING

### Primary: Expats in Japan
- ~3 million foreign residents in Japan
- Japan has the highest language barrier for daily life admin
- Phone-first culture (many services don't have English online options)
- **If 1% convert at $19/month = $570K MRR**

### Secondary: Expats in South Korea, China, Germany, France
- Similar language barriers, similar pain
- ~2 million expats in Korea, ~1 million in major EU countries
- Expand after Japan is proven

### Tertiary: Business travelers (the current market)
- Keep restaurant/hotel booking as a feature
- But it's not the core anymore — it's a gateway

### Total addressable market
- ~10 million English-speaking expats in non-English countries
- At 1% penetration, $19 avg: **$1.9M MRR / $23M ARR**
- At 3% penetration: **$5.7M MRR / $68M ARR**
- This is a real, profitable business without needing to be a unicorn

---

## 9. COMPETITIVE LANDSCAPE

| Competitor | What they do | Why Moshi wins |
|---|---|---|
| Google Translate | Translates text/speech | Doesn't make the call for you |
| Hotel concierge | Handles requests | Only available at the hotel, limited hours, slow |
| Relocation agencies | Help with setup | Expensive ($2-5K), one-time, not ongoing |
| Language tutors | Teach you the language | Takes years, doesn't solve today's problem |
| Local friends | Help when available | Unreliable, social debt, limited availability |

**Moshi's moat**: It's the only product that **does the task for you**, in real-time, for $1-3 per task. Everything else either requires you to do it yourself or costs 100x more.

---

## 10. GROWTH STRATEGY

### Phase 1: Japan expat community (Month 1-3)
- **Reddit**: r/japanlife, r/movingtojapan, r/japanfinance — these communities constantly ask "how do I call X in Japanese?"
- **Facebook groups**: Tokyo Expats, Osaka Foreigners, Japan Life
- **Content marketing**: "How to call your landlord in Japan" → Moshi handles it for you
- **Partnerships**: Share houses, language schools, relocation services

### Phase 2: Word of mouth + content (Month 3-6)
- Blog: "The expat's guide to Japanese bureaucracy" (SEO play)
- YouTube: Screen recordings of Moshi handling real calls (with permission)
- Referral program: Give 3 free tasks, get 3 free tasks

### Phase 3: Expand to Korea + EU (Month 6-12)
- Same playbook, different languages
- Korea is the second-easiest market (similar phone-first culture)
- Germany/France for EU expansion

### Phase 4: B2B (Month 12+)
- White-label for relocation agencies
- API for property management companies (handle tenant calls)
- Integration with HR platforms (help employees relocating abroad)

---

## 11. WHAT CHANGES IN THE PRODUCT

### Keep
- AI calling engine (the core tech)
- Multi-language support
- Cultural awareness layer
- Transcript + summary generation
- Credit/subscription billing

### Change
- **Dashboard**: From "call history" to "task board"
- **Input**: From "restaurant booking form" to "describe what you need"
- **Categories**: From "restaurant only" to "any phone call"
- **Output**: From "booking confirmed" to "action items + follow-up"
- **Positioning**: From "restaurant booking tool" to "personal concierge for life abroad"

### Add
- Task queue (multiple tasks, processed sequentially)
- Action items extraction (what does the user need to do next?)
- Follow-up tasks (one-tap to create from completed task)
- Recurring tasks
- Photo-to-task (OCR + translation of documents)
- "Needs Attention" status for tasks requiring user action
- Reminders (appointment coming up, follow-up due)

### Remove
- Country-specific restaurant features (keep as a task type, not the whole product)
- Complex restaurant-specific UI (seating pills, menu types) — these become optional details in the free-text input

---

## 12. TECHNICAL ARCHITECTURE CHANGES

### Current flow
```
Restaurant form → Build objective → Make call → Show transcript
```

### New flow
```
Free text input → GPT classifies + plans → Build call strategy → Make call → Extract outcomes + action items → Show task result
```

### New components needed

1. **Task Parser** — GPT takes free text, extracts:
   - Who to call (business/person)
   - What the goal is
   - What info the AI needs to provide
   - What info the AI needs to collect
   - What success looks like

2. **Call Planner** — generates a conversation strategy:
   - Opening statement
   - Key points to communicate
   - Questions to ask
   - Acceptable outcomes
   - When to escalate / give up

3. **Outcome Extractor** — after the call, GPT analyzes the transcript:
   - What was the result?
   - What action items exist for the user?
   - Is follow-up needed?
   - What reference numbers / dates / names were mentioned?

4. **Task Queue Runner** — processes multiple tasks:
   - Sequential calling (one at a time)
   - Status updates in real-time
   - Retry logic for busy lines
   - Business hours awareness (don't call at midnight)

5. **Reminder System** — notifications for:
   - Upcoming appointments
   - Follow-up tasks due
   - Action items not yet completed

---

## 13. IMPLEMENTATION ROADMAP

### Sprint 1 (Week 1-2): Task-based input
- Replace restaurant form with free-text task creation
- Keep restaurant booking as a "quick template"
- GPT task parser (classify intent, extract details)
- New task board dashboard

### Sprint 2 (Week 3-4): Enhanced call handling
- Call planner (conversation strategy per task type)
- Outcome extractor (action items from transcript)
- "Needs Attention" status
- Follow-up task creation

### Sprint 3 (Week 5-6): Task queue
- Multiple tasks in a queue
- Sequential processing
- Real-time status updates
- Business hours awareness

### Sprint 4 (Week 7-8): Polish + launch
- Subscription billing (Stripe)
- Onboarding flow for new expats
- Quick templates for common tasks
- Landing page pivot (expat-focused messaging)

### Sprint 5 (Week 9-12): Growth features
- Photo-to-task (OCR)
- Recurring tasks
- Reminders
- Referral program

---

## TL;DR

**The pivot**: From "restaurant booking tool for tourists" to "personal AI concierge for anyone living abroad."

**The UX**: Create a task in plain English → Moshi calls, handles it, reports back with action items.

**The market**: 3M+ expats in Japan alone, $19-39/month, 1% penetration = $570K-1.1M MRR.

**The moat**: Only product that actually makes the call for you. Everything else requires you to do it yourself.

**The timeline**: 8 weeks to MVP pivot, keeping all existing tech.

**The bet**: Language barriers in daily life are a bigger, more recurring pain than restaurant bookings. People will pay monthly to make that pain go away.
