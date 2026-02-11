# Atlas Concierge — Your Global Voice

A premium AI-powered concierge SaaS that calls businesses anywhere in the world on your behalf — fluently, discreetly, and accurately.

## Features

- **Cross-Language Calling** — AI agents call in Japanese, Korean, Mandarin, French, Italian, Spanish, German, and Thai
- **Cultural Intelligence** — Country-specific etiquette, greeting scripts, and calling hour guidance
- **Structured Call Planning** — Auto-generated call plans with opening scripts, objectives, and fallback options
- **Full Transcripts & Summaries** — Every call produces a transcript, summary, outcome, and action items
- **Credit-Based Subscription** — Simple/Booking/Complex tiers using 1/2/3 credits respectively
- **Premium Dashboard** — Track calls, credits, transaction history, and manage your account

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js (credentials provider)
- **Voice Calls**: Twilio (outbound calling, recording, speech-to-text)
- **AI Engine**: OpenAI GPT-4o (conversation logic, translation, summaries)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy `.env` and configure your keys:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Required for REAL calls
OPENAI_API_KEY="sk-..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
BASE_URL="https://your-ngrok-url.ngrok-free.app"
```

> **Without Twilio/OpenAI keys**, the app runs in **demo mode** — calls are simulated with fake transcripts.
> **With real keys**, the app places actual phone calls via Twilio, speaks in the target language using OpenAI, and generates real transcripts/summaries.

### 3. Initialize database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed demo data

```bash
npx tsx prisma/seed.ts
```

### 5. Run dev server

```bash
npm run dev
```

### 6. Login with demo account

- **Email**: `demo@atlas.com`
- **Password**: `password123`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + registration
│   │   ├── calls/         # Call CRUD + simulation
│   │   ├── credits/       # Credit balance & transactions
│   │   └── dashboard/     # Dashboard stats
│   ├── dashboard/
│   │   ├── call/[id]/     # Call detail view
│   │   ├── credits/       # Credit management
│   │   ├── history/       # Call history
│   │   ├── new-call/      # New call request form
│   │   ├── plans/         # Subscription plans
│   │   └── settings/      # Account settings
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── navigation.tsx     # Sidebar navigation
│   └── providers.tsx      # Session provider
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── call-engine.ts     # Real call orchestration (Twilio + OpenAI)
│   ├── cultural-layer.ts  # Country etiquette profiles
│   ├── db.ts              # Prisma client
│   ├── openai.ts          # OpenAI client, prompts, summary generation
│   ├── session.ts         # Server session helper
│   ├── twilio.ts          # Twilio client wrapper
│   └── utils.ts           # Utility functions
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Demo data seeder
```

## Subscription Plans

| Plan     | Price    | Credits/Month | Features                          |
|----------|----------|---------------|-----------------------------------|
| Explorer | Free     | 3             | Simple inquiries, basic summaries |
| Member   | $29/mo   | 10            | All call types, transcripts       |
| Global   | $79/mo   | 40            | Priority, rollover, dedicated     |

## Credit Costs

| Call Type | Credits | Use Case                              |
|-----------|---------|---------------------------------------|
| Simple    | 1       | Stock checks, hours, basic questions  |
| Booking   | 2       | Reservations, appointments            |
| Complex   | 3       | Negotiations, complaints, special     |

## Supported Countries

Japan, South Korea, China, France, Italy, Spain, Germany, Thailand

## How Real Calls Work

```
User submits call request
        ↓
App calls initiateCall() → OpenAI generates greeting + system prompt
        ↓
Twilio places outbound call to business phone number
        ↓
Business picks up → /api/twilio/voice webhook returns TwiML
        ↓
AI greeting is spoken via Twilio <Say> (Polly neural voice)
        ↓
<Gather> listens for business response (speech-to-text)
        ↓
/api/twilio/gather receives transcribed speech
        ↓
OpenAI generates agent's next reply in target language
        ↓
Reply is spoken, another <Gather> starts → loop continues
        ↓
When objective achieved, OpenAI signals [CALL_COMPLETE]
        ↓
Call ends → /api/twilio/status triggers AI summary generation
        ↓
User sees transcript, summary, outcome, action items, recording
```

### Setting Up for Real Calls (MVP Test)

1. **Create a Twilio account** at https://www.twilio.com
2. **Buy a phone number** with voice capability
3. **Get your Account SID and Auth Token** from the Twilio console
4. **Install ngrok** for local webhook tunneling: `npm install -g ngrok`
5. **Start ngrok**: `ngrok http 3000`
6. **Set `BASE_URL`** in `.env` to your ngrok URL (e.g. `https://abc123.ngrok-free.app`)
7. **Set all Twilio and OpenAI keys** in `.env`
8. **Restart the dev server**: `npm run dev`
9. **Submit a call request** and click "Make Call" — a real phone call will be placed

### Key Details

- **Failed calls are auto-refunded** — if the line is busy, no answer, or call fails, credits are returned
- **Calls are recorded** — recordings are stored via Twilio and linked in the call detail page
- **AI summaries** are generated automatically when the call ends using GPT-4o
- **Max 12 conversation turns** per call to prevent runaway costs
- **Answering machine detection** — if a machine picks up, the call hangs up and is marked failed

## Next Steps (Production)

- [ ] Integrate Stripe for real payments
- [ ] Add WebSocket push for real-time call status updates
- [ ] Add email/SMS notifications on call completion
- [ ] Expand country coverage
- [ ] Add expense integration (SAP Concur, Expensify)
- [ ] Add mobile app (React Native)
- [ ] Add call scheduling (schedule calls for specific times)
- [ ] Add human operator escalation fallback
