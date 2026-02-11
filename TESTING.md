# Moshi — End-to-End Testing Plan

## Prerequisites

### Environment Setup
- [ ] `.env` has valid `OPENAI_API_KEY`
- [ ] `.env` has valid `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- [ ] `.env` has valid `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (or test without for dev mode)
- [ ] `.env` has `BASE_URL` set to your ngrok/tunnel URL (Twilio needs to reach your webhooks)
- [ ] `npx prisma db push` has been run
- [ ] `npx prisma generate` has been run
- [ ] Dev server running: `npm run dev`
- [ ] Twilio phone number is configured (can make outbound calls)
- [ ] At least one test user exists in the database with credits > 0

### Tools Needed
- ngrok or similar tunnel for Twilio webhooks: `ngrok http 3000`
- A real phone number you can answer for test calls
- A real email address you can check for test emails
- Browser dev tools open (Network tab + Console)

---

## 1. USER JOURNEY: Registration & Login

### 1.1 Email/Password Registration
1. Go to `/register`
2. Fill in name, email, password
3. Submit → should redirect to `/login?registered=true`
4. Verify success message appears on login page
5. Check DB: user exists with 3 welcome credits

### 1.2 Email/Password Login
1. Go to `/login`
2. Enter credentials from 1.1
3. Submit → should redirect to `/dashboard`
4. Verify dashboard loads with user's name and credit count

### 1.3 Google OAuth (when configured)
1. Go to `/login` → click "Sign in with Google"
2. Complete Google flow
3. Should redirect to `/dashboard`
4. Check DB: user created with 3 welcome credits

### 1.4 Edge Cases
- [ ] Register with existing email → error message
- [ ] Login with wrong password → error message
- [ ] Login with OAuth email via password → appropriate error
- [ ] Access `/dashboard` without login → redirect to login (when auth enabled)

---

## 2. USER JOURNEY: New Call Task

### 2.1 Step 1 — Input (Call Mode)
1. Go to `/dashboard/new-task`
2. Verify default mode is "Phone Call" (toggle highlighted)
3. **URL extraction:** Paste a Google Maps or restaurant URL → verify business card appears with name, phone, address
4. **Phone input:** Type `+81 3-1234-5678` → blur → verify phone is confirmed (green card)
5. **Local phone:** Type `0312345678` (no +) → blur → verify it's accepted
6. **Saved places:** If any exist, verify they appear and clicking one fills the business card
7. **Message input:** Type a task description > 10 chars → verify arrow button appears
8. **Example chips:** Click a chip → verify textarea fills with the prompt
9. **Placeholder rotation:** Verify placeholder text rotates every 3.5s
10. **Parse:** Click arrow or press Enter → verify loading state → transitions to Step 2

### 2.2 Step 2 — Clarify (Call Mode)
1. Verify "Edit request" back button works
2. Verify extracted business card shows if URL was used
3. Verify Moshi's understanding shows: category icon, summary, extracted details
4. Verify phone field shows if no phone was provided
5. Verify phone validation: `+81312345678` ✓, `0312345678` ✓, `123` ✗
6. Verify dynamic missing fields from GPT appear (date, time, name, etc.)
7. Verify fallback question with options appears if GPT suggests one
8. Verify "Everything looks good!" shows when all required fields are filled
9. Verify "Send Moshi · 1 credit" button enables only when `canConfirm` is true
10. Verify call/email toggle exists and switching to email changes the form

### 2.3 Call Submission
1. Fill all required fields → click "Send Moshi"
2. Verify loading state on button
3. Verify redirect to `/dashboard/call/[id]`
4. Check DB: CallRequest created with status "pending" → then "in_progress"
5. Check DB: User credits decremented by 1
6. Check DB: CreditTransaction created with type "usage"

### 2.4 Calling Hours Enforcement
1. Set country to Japan
2. Submit a call task at a time outside 10:00-20:00 JST
3. Verify error message about business hours appears
4. Verify credits are NOT deducted (call was rejected before initiation)

---

## 3. USER JOURNEY: New Email Task

### 3.1 Step 1 — Input (Email Mode)
1. Toggle to "Email" mode
2. Verify step 1 shows email input (Mail icon) instead of phone/URL input
3. Verify placeholder says "contact@business.com"
4. Verify example chips change to email-specific ones (Hotel booking, Formal complaint, etc.)
5. Verify placeholder text rotates through email examples
6. Verify bottom copy says "Moshi drafts the email, you review it, then it sends"
7. Type an email address → verify validation (amber warning for invalid)
8. Type a task description → parse

### 3.2 Step 2 — Clarify (Email Mode)
1. Verify email address field shows (not phone)
2. Verify email from step 1 is pre-filled
3. Verify "Everything looks good! Preview the email draft." shows when email is valid
4. Verify "Preview email draft · 1 credit" button text
5. Click preview → verify loading state ("Drafting email...")

### 3.3 Step 3 — Email Review
1. Verify email preview shows: To, Reply-to, Subject, Body
2. Verify "Reply-to" says "Replies will go to your account email"
3. Verify translation toggle works: Original language ↔ English Translation
4. Verify "Send Email · 1 credit" button
5. Click send → verify success redirect
6. Check DB: CallRequest created with taskType "email", status "completed"
7. Check email inbox (or console log in dev mode) for the sent email

### 3.4 Email Edge Cases
- [ ] Draft without email address → should show email field in clarify step
- [ ] Invalid email format → validation error, button disabled
- [ ] User with 0 credits → "Insufficient credits" error on send
- [ ] Toggle from email to call mid-flow → form updates correctly

---

## 4. LIVE CALL TESTING (requires Twilio + ngrok)

### 4.1 Setup
1. Start ngrok: `ngrok http 3000`
2. Set `BASE_URL` in `.env` to the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Restart dev server

### 4.2 Basic Call Flow
1. Create a call task with YOUR phone number as the business phone
2. Answer the call when it rings
3. Verify: AI speaks greeting in the correct language
4. Respond with speech → verify AI replies appropriately
5. Complete the conversation → verify AI says goodbye and hangs up
6. Check DB: transcript populated, status "completed", summary generated

### 4.3 Call Scenarios to Test

#### Restaurant Reservation (Japanese)
- Task: "Book a table for 2 at 7pm this Friday"
- Country: Japan
- Expected: Greeting in Japanese, asks for reservation, gives name, confirms details
- Test: Say "7pm is not available, how about 8pm?" → AI should accept alternative
- Test: Say "We need a credit card" → AI should say "I'll check with my client"

#### Doctor Appointment (English)
- Task: "Book a checkup appointment for next week"
- Country: Australia
- Expected: Greeting in English, asks for appointment, gives patient name
- Test: Say "We're fully booked this week" → AI should ask about next week
- Test: Say "Can I put you on a waitlist?" → AI should accept

#### Bill Dispute (French)
- Task: "My internet bill is €20 higher than usual, ask why"
- Country: France
- Expected: Greeting in French, states the billing issue
- Test: Say "What's your account number?" → AI should say "I'll check with my client"

### 4.4 Edge Cases
- [ ] **No answer:** Let it ring → verify status becomes "failed", credit refunded
- [ ] **Busy signal:** Call a busy number → verify refund
- [ ] **Answering machine:** Let voicemail pick up → verify machine detection works
- [ ] **Very short call:** Answer and immediately hang up → verify "no meaningful conversation" summary
- [ ] **Max turns:** Have a 12+ turn conversation → verify graceful wrap-up
- [ ] **Low confidence speech:** Mumble or speak quietly → verify "could you repeat that?"
- [ ] **DTMF:** Press keypad digits → verify they're captured as input

### 4.5 Webhook Security
- [ ] POST to `/api/twilio/voice?callRequestId=xxx` without Twilio signature → should get rejected (in production mode)
- [ ] POST to `/api/twilio/gather?callRequestId=xxx` without signature → rejected
- [ ] POST to `/api/twilio/status?callRequestId=xxx` without signature → rejected

---

## 5. PAYMENT & CREDITS

### 5.1 Credit System
- [ ] New user gets 3 welcome credits
- [ ] Creating a call task deducts 1 credit
- [ ] Sending an email deducts 1 credit
- [ ] Failed call refunds the credit
- [ ] User with 0 credits cannot create tasks (402 error)
- [ ] Credit transactions are recorded correctly

### 5.2 Stripe Integration (when built)
- [ ] Plans page shows correct pricing: Explorer (Free), Member ($19/mo), Global ($79/mo)
- [ ] Upgrade flow redirects to Stripe Checkout
- [ ] Successful payment updates user plan and credits
- [ ] Webhook handles subscription events (created, updated, cancelled)
- [ ] Downgrade preserves credits until end of billing period

---

## 6. COUNTRY & PLAN RESTRICTIONS

### 6.1 Country Selector
- [ ] Explorer (free) users see only Japan, France, Spain as selectable
- [ ] Other countries show lock icon and are unclickable
- [ ] "Upgrade to unlock all countries" link appears at bottom
- [ ] Member/Global users can select all 11 countries
- [ ] Selected country persists in localStorage across sessions

### 6.2 Language Verification
- [ ] Japan → Japanese greeting, Japanese speech recognition
- [ ] France → French greeting, French speech recognition
- [ ] Spain → Spanish greeting, Spanish speech recognition
- [ ] Australia → English (AU) greeting, English speech recognition
- [ ] Verify each country's voice sounds natural (Neural voices)

---

## 7. DASHBOARD & TASK HISTORY

### 7.1 Task List
- [ ] Completed tasks show summary, outcome badge, and timestamp
- [ ] Failed tasks show failure reason
- [ ] Email tasks show "Email" badge vs "Call" badge
- [ ] Clicking a task opens the detail view

### 7.2 Task Detail (Call)
- [ ] Shows full transcript
- [ ] Shows AI summary and action items
- [ ] Shows outcome (success/partial/failed/callback_needed/waitlisted)
- [ ] Shows recording player if recording URL exists
- [ ] Shows business name, phone, country

### 7.3 Task Detail (Email)
- [ ] Shows sent email subject and body
- [ ] Shows recipient email address
- [ ] Shows "completed" status

---

## 8. ERROR HANDLING & RESILIENCE

### 8.1 OpenAI Failures
- [ ] If OpenAI is down during call → AI says "one moment please" and retries
- [ ] If OpenAI is down during email draft → error message shown to user
- [ ] If OpenAI is down during parse → error message shown to user

### 8.2 Twilio Failures
- [ ] Invalid phone number → call fails, credit refunded
- [ ] Twilio service down → call creation fails with error message
- [ ] Network timeout during call → Twilio handles with hangup

### 8.3 Database Failures
- [ ] Concurrent transcript updates don't lose data (atomic append)
- [ ] DB connection failure → appropriate error responses

### 8.4 Input Validation
- [ ] Empty task description → rejected
- [ ] Description < 10 chars → rejected
- [ ] Invalid phone format → UI validation prevents submission
- [ ] Invalid email format → UI validation prevents submission
- [ ] Missing required fields → button stays disabled

---

## 9. PERFORMANCE & MONITORING

### 9.1 Response Times
- [ ] Task parse (GPT): < 5 seconds
- [ ] Email draft (GPT): < 8 seconds
- [ ] Call initiation: < 3 seconds after task creation
- [ ] Gather webhook response: < 10 seconds (Twilio timeout is 15s)
- [ ] Post-call summary: < 10 seconds

### 9.2 Logging
- [ ] All errors are logged with `console.error`
- [ ] OpenAI retry attempts are logged
- [ ] Twilio webhook validation failures are logged
- [ ] Call initiation failures are logged

---

## 10. PRE-LAUNCH CHECKLIST

### Infrastructure
- [ ] `BASE_URL` set to production domain
- [ ] HTTPS configured
- [ ] Twilio phone number verified for production
- [ ] Resend domain verified for email sending
- [ ] OpenAI API key has sufficient quota
- [ ] Database backed up

### Security
- [ ] Auth middleware re-enabled (currently disabled for dev)
- [ ] Dev user fallback removed from `session.ts`
- [ ] Twilio webhook validation active (BASE_URL set)
- [ ] No API keys in client-side code
- [ ] NEXTAUTH_SECRET is a strong random string

### Configuration
- [ ] Google OAuth credentials configured (if using)
- [ ] Stripe keys configured (when ready)
- [ ] Error monitoring set up (Sentry or similar)
- [ ] Analytics set up

### Content
- [ ] Landing page copy reviewed
- [ ] Plan pricing confirmed
- [ ] Country list confirmed
- [ ] Email templates reviewed
