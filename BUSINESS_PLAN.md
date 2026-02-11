# Atlas Concierge — Business Plan & Expansion Analysis

> Goal: Profitable SaaS business, not a VC-funded moonshot. Capital-efficient, high-margin, niche dominance.

---

## 1. WHAT WE HAVE TODAY

**Core product**: AI concierge that calls restaurants in any country, in the local language, and books a table for you.

**Moat ingredients**:
- Real phone calls via Twilio + GPT-4o conversational AI
- Cultural/language layer (Japanese, French, Italian, etc.)
- URL paste → auto-extract restaurant details (Tabelog, Yelp, Google Maps, etc.)
- Credit-based pricing

**Target user today**: Travellers who want to eat at restaurants that don't have online booking, don't speak English, or require phone-only reservations (very common in Japan, France, Italy, Spain, Korea).

---

## 2. MARKET REALITY

### Why this works
- **Japan alone**: ~80% of high-end restaurants are phone-only booking. Tabelog has 900k+ listings. OpenTable/Resy barely exist there.
- **France/Italy/Spain**: Many restaurants still prefer phone bookings, especially outside major cities.
- **The pain is real**: Travellers currently rely on hotel concierges (expensive hotels only), fixers ($50-100/booking), or just skip the restaurant entirely.

### Market size (bottom-up)
- ~100M international restaurant visits/year in Japan alone
- Even 0.1% penetration = 100k bookings/year
- At $5-10/booking = $500k-$1M ARR from Japan alone
- Add France, Italy, Spain, Korea, Thailand = 3-5x multiplier
- **Realistic Year 2 target: $1-3M ARR**

### Competition
| Competitor | Weakness |
|---|---|
| Hotel concierge | Only for hotel guests, slow, limited |
| Pocket Concierge | Japan-only, limited inventory, takes commission from restaurants |
| TableAll | Japan-only, expensive ($30+/booking), manual human callers |
| Resy/OpenTable | Don't cover phone-only restaurants |
| Google Duplex | Not available internationally, not consumer-facing |

**Our edge**: Automated (cheap to operate), multilingual, works with ANY restaurant (not just partners), and the user controls the experience.

---

## 3. EXPANSION ROADMAP — PHASED

### Phase 1: Nail the Core (Months 1-6) — CURRENT
**Focus**: Restaurant booking for travellers in Japan, then France/Italy.

**Revenue model**: Credit packs
| Pack | Price | Credits | Per-booking cost |
|---|---|---|---|
| Starter | $9.99 | 3 | $3.33 |
| Explorer | $24.99 | 10 | $2.50 |
| Frequent | $49.99 | 25 | $2.00 |

**Unit economics**:
- Twilio call cost: ~$0.05-0.15/min, avg call 3-5 min = $0.15-0.75
- OpenAI GPT-4o: ~$0.05-0.10/call
- **COGS per call: ~$0.30-0.85**
- **Revenue per call: $2.00-3.33**
- **Gross margin: 65-85%** ← excellent for SaaS

**Key metrics to hit**:
- 80%+ booking success rate
- <5 min average call duration
- 4.5+ star user rating
- 500+ paying users

---

### Phase 2: Expand the Concierge (Months 6-12)

Once restaurant booking is solid, the same AI calling infrastructure supports:

#### 2a. Beyond Restaurants
| Use Case | Effort | Revenue Potential |
|---|---|---|
| **Salon/barber booking** (Japan, Korea) | Low — same flow | Medium |
| **Doctor/dentist appointments** (abroad) | Medium — needs medical vocab | High |
| **Activity/tour reservations** | Low | Medium |
| **Hotel special requests** (early check-in, room upgrade calls) | Low | Medium |
| **Complaint/inquiry calls** (insurance, utilities for expats) | Medium | High |

#### 2b. Subscription Model
Move from credit packs to subscriptions for repeat users:

| Plan | Price/mo | Includes | Target |
|---|---|---|---|
| Free | $0 | 1 call/month | Trial |
| Traveller | $14.99/mo | 8 calls | Frequent travellers |
| Expat | $29.99/mo | 20 calls + priority | Expats living abroad |
| Business | $99.99/mo | 50 calls + team | Travel agencies, corporate |

#### 2c. B2B Channel
- **Travel agencies**: White-label the booking engine. They charge clients $50/booking, pay us $5. Volume play.
- **Hotels**: Offer as a guest amenity. Hotel pays $200-500/mo, guests get free bookings. Replaces human concierge desk.
- **Corporate travel**: Companies like Amex Travel, TripActions integrate our API.

---

### Phase 3: Platform Play (Months 12-24)

#### 3a. Restaurant Relationship Layer
- After making 100+ calls to a restaurant, we have data: availability patterns, popular times, how they handle requests.
- Offer restaurants a **free dashboard**: "You received 47 booking requests this month via Atlas. Here's your peak demand times."
- This builds a relationship → eventually restaurants opt into **instant confirm** (no call needed) → higher margin for us.

#### 3b. Review/Intel Layer
- Post-dining: "How was your meal at Sushi Saito?" → collect structured reviews
- Build the **best dataset of phone-only restaurants** in the world
- This data is valuable to: travel publishers, food media, Google, Michelin

#### 3c. Multi-Language Concierge API
- Expose the AI calling engine as an API
- Other apps (travel apps, expat apps, hotel apps) integrate our calling capability
- **API pricing**: $1-2/call, volume discounts
- This is the highest-leverage move — we become infrastructure

---

## 4. POSITIONING & BRAND

### Who we are
> "Atlas is your AI concierge for the real world — we make phone calls so you don't have to, in any language."

### Who we are NOT
- Not a restaurant directory (we work with ALL restaurants)
- Not a reservation platform (we don't need restaurant partnerships)
- Not a translation app (we take action, not just translate)

### Brand positioning by segment

| Segment | Message | Channel |
|---|---|---|
| **Japan travellers** | "Book any restaurant in Japan, even the ones with no English" | r/JapanTravel, travel blogs, YouTube |
| **Foodies** | "Get into the restaurants that don't take online bookings" | Instagram, food Twitter, Eater |
| **Expats** | "Stop dreading phone calls in a language you don't speak" | Expat Facebook groups, Reddit |
| **Travel agents** | "Offer premium restaurant booking without hiring Japanese speakers" | Industry conferences, LinkedIn |

### Pricing psychology
- **Don't charge per minute** — users hate uncertainty
- **Charge per booking attempt** (1 credit = 1 call, regardless of duration)
- **Refund credits for failed calls** — builds trust
- Position as **cheaper than alternatives** ($3 vs $50 for a human fixer)

---

## 5. GROWTH STRATEGY (PROFITABLE, NOT VC-DEPENDENT)

### Customer acquisition (low-cost)
1. **SEO/Content**: "How to book restaurants in Tokyo without speaking Japanese" — this is a massive search query with no good answer
2. **Reddit/community**: r/JapanTravel (2.5M members), r/japanlife, r/travel — genuine helpful posts, not spam
3. **YouTube**: Partner with Japan/food travel YouTubers for demo videos
4. **Referral**: Give 2 free credits for every friend who signs up and makes a booking
5. **Trip planning integration**: Partner with Wanderlog, TripIt, Google Trips

### Retention
- Post-booking follow-up: "Your reservation at Sushi Saito is confirmed for Friday 7pm. Here's directions + what to expect"
- Trip planning: "You're going to Tokyo next week. Want us to book all 5 restaurants on your list?"
- Seasonal: "Cherry blossom season is coming — popular restaurants fill up fast. Book now?"

### Revenue milestones (conservative)
| Milestone | Users | MRR | Timeline |
|---|---|---|---|
| Ramen profitable | 100 | $1,500 | Month 3 |
| Salary replacement | 500 | $7,500 | Month 6 |
| Real business | 2,000 | $30,000 | Month 12 |
| Scaling | 8,000 | $120,000 | Month 18 |
| Established | 20,000 | $300,000 | Month 24 |

### Cost structure at $30k MRR
- Twilio/OpenAI (COGS): ~$6,000 (20%)
- Infrastructure (Vercel, DB): ~$500
- Marketing: ~$3,000
- Your time: priceless
- **Net profit: ~$20,000/mo** ← 67% net margin

---

## 6. WHAT NOT TO DO

1. **Don't build a restaurant directory** — that's a content business, not a SaaS business
2. **Don't take commissions from restaurants** — it misaligns incentives and limits inventory
3. **Don't try to replace OpenTable** — they own online booking, we own phone booking
4. **Don't expand to 20 countries at once** — nail Japan, then France, then expand
5. **Don't raise VC money** — the unit economics are great, growth is organic, keep 100% equity
6. **Don't hire until $50k MRR** — the AI does the work, you do the product
7. **Don't build a mobile app yet** — PWA/web is fine until 5k+ users

---

## 7. IMMEDIATE NEXT STEPS

### This week
- [ ] Get 10 beta users to test real bookings in Japan
- [ ] Set up Stripe for credit pack purchases
- [ ] Create landing page optimized for "book restaurant Japan" SEO
- [ ] Record a demo video showing the full flow

### This month
- [ ] Launch on r/JapanTravel with a genuine "I built this" post
- [ ] Get booking success rate to 80%+
- [ ] Add call recording playback so users can hear the conversation
- [ ] Implement the subscription model alongside credit packs

### This quarter
- [ ] 500 paying users
- [ ] Expand to France and Italy
- [ ] Launch B2B pilot with 2-3 travel agencies
- [ ] Build the post-booking experience (directions, tips, follow-up)

---

## 8. DEFENSIBILITY

**Why can't someone just copy this?**

1. **Cultural knowledge compounds** — every call teaches the AI about Japanese phone etiquette, French restaurant customs, etc. This gets better with scale.
2. **Restaurant intelligence** — after 10,000 calls, we know which restaurants are easy to book, which need callbacks, which are always full on Fridays. No one else has this data.
3. **User trust** — people don't switch concierges easily. Once you've had 5 successful bookings, you're locked in.
4. **Prompt engineering depth** — the system prompt, cultural layer, and conversation flow are deeply tuned. A competitor would need months to match quality.
5. **Network effects (Phase 3)** — if restaurants opt into instant confirm, users get faster bookings, which attracts more users, which attracts more restaurants.

---

## TL;DR

**The play**: Own "AI phone concierge for travellers" starting with restaurant booking in Japan. Expand to more countries and use cases. Charge $2-3/call with 70%+ margins. Grow organically to $300k+ MRR within 2 years without raising money. The infrastructure (AI calling engine) becomes the real asset — eventually licensable as an API.

**Why it works**: Real pain point, no good solution exists, excellent unit economics, AI makes it scalable without hiring humans, and the moat deepens with every call.
