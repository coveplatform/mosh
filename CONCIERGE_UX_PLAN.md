# Atlas Concierge — Multi-Service UX & System Design

> How the concierge works beyond restaurants. From "I need a haircut, a doctor, and dinner this week" to everything booked — without the user writing a monologue.

---

## 1. THE CORE PROBLEM

Restaurant booking works because the form is tight: name, phone, date, time, guests. Done.

But what about:
- "I need a haircut in Shibuya on Thursday"
- "Book me a doctor who speaks English near my hotel"
- "I want a cooking class, a temple tour, and dinner on Saturday"
- "Call my Airbnb host and ask if early check-in is possible"

Each of these has **different required fields**. We can't build a custom form for every service type. But we also can't make the user write a paragraph explaining what they want.

**The answer: structured intent selection + smart defaults + conversational fill-in.**

---

## 2. THE UX MODEL: "TASK CARDS"

### How it works

The user doesn't type a monologue. They **pick a task type**, then we show only the fields that matter for that task. Think of it like choosing a template.

```
┌─────────────────────────────────────────┐
│  What do you need?                      │
│                                         │
│  🍽  Restaurant    ✂️  Haircut/Salon     │
│  🏥  Doctor        💆  Spa/Massage       │
│  🎯  Activity      🏨  Hotel Request     │
│  📞  Custom Call                         │
└─────────────────────────────────────────┘
```

Each task type has its own **minimal form** — only the fields that matter:

### Restaurant (what we have now)
- Paste link OR enter name + phone
- Guests, date, time, seating
- Optional: dietary, occasion, menu choice

### Haircut / Salon
- Paste link OR enter name + phone
- Service type: [Cut] [Cut + Color] [Color] [Treatment] [Styling] [Other]
- Preferred stylist (optional — text field)
- Date + time picker
- Gender: [Male] [Female] [No preference]
- Notes: "First time, want something short" (optional free text)

### Doctor / Medical
- Paste link OR enter name + phone
- Visit type: [General checkup] [Specific issue] [Specialist] [Dental] [Eye]
- Urgency: [This week] [Flexible] [ASAP]
- Language preference: [English-speaking required] [Local language OK]
- Insurance: text field (optional)
- Symptoms/reason: brief text (optional, private)

### Spa / Massage
- Paste link OR enter name + phone
- Service: [Massage] [Facial] [Onsen/Bath] [Package]
- Duration: [30min] [60min] [90min] [120min]
- Date + time
- Guests: [1] [2] (couples)

### Activity / Tour
- Paste link OR enter name + phone
- Type: [Cooking class] [Temple tour] [Museum] [Workshop] [Other]
- Guests + date + time
- Language: [English] [Local language]

### Hotel Request (no booking — just a call)
- Hotel name + phone
- Request type: [Early check-in] [Late checkout] [Room upgrade] [Extra bed] [Airport transfer] [Other]
- Details: brief text

### Custom Call (the escape hatch)
- Business name + phone
- "What do you need?" — free text, 1-2 sentences
- Date/time if relevant

**Key insight**: The "Custom Call" option means we never block the user. If their need doesn't fit a template, they can always describe it in a sentence. But 80% of use cases will fit a template, which is faster.

---

## 3. THE QUEUE MODEL: "MY WEEK"

This is the killer feature. Instead of one booking at a time, the user **queues up multiple tasks** and the concierge works through them.

### UX Flow

```
Step 1: User adds tasks to their queue
┌─────────────────────────────────────────┐
│  My Week — Tokyo, Nov 12-17             │
│                                         │
│  ☐ Haircut — Thursday afternoon         │
│  ☐ Sushi Saito — Friday 7pm, 2 guests  │
│  ☐ Doctor (English) — flexible          │
│  ☐ Cooking class — Saturday morning     │
│                                         │
│  [+ Add another task]                   │
│                                         │
│  ──────────────────────────────────      │
│  4 tasks · 4 credits                    │
│  [Start Concierge →]                    │
└─────────────────────────────────────────┘

Step 2: Concierge works through the queue
┌─────────────────────────────────────────┐
│  My Week — Tokyo, Nov 12-17             │
│                                         │
│  ✅ Haircut — BOOKED Thu 2pm, ALBUM     │
│     Shibuya · ¥4,400                    │
│                                         │
│  🔄 Sushi Saito — CALLING NOW...        │
│     On the phone · 2:34 elapsed         │
│                                         │
│  ⏳ Doctor — QUEUED                      │
│     Will call after Sushi Saito         │
│                                         │
│  ⏳ Cooking class — QUEUED               │
│     Will call after Doctor              │
│                                         │
└─────────────────────────────────────────┘

Step 3: All done
┌─────────────────────────────────────────┐
│  My Week — Tokyo, Nov 12-17             │
│                                         │
│  ✅ Haircut — Thu 2pm, ALBUM Shibuya    │
│  ✅ Sushi Saito — Fri 7pm, confirmed    │
│  ⚠️ Doctor — needs callback Thu AM      │
│  ✅ Cooking class — Sat 10am, ¥8,800    │
│                                         │
│  3/4 booked · 1 needs follow-up         │
│  [View details] [Retry Doctor →]        │
└─────────────────────────────────────────┘
```

### Why this is powerful

1. **Batch = less friction** — user spends 3 minutes setting up their week, then walks away
2. **Concierge feels real** — it's working for you in the background, like a human assistant
3. **Higher ARPU** — 4 tasks = 4 credits instead of 1
4. **Retry is natural** — "Doctor needs callback" → one tap to retry
5. **Trip planning integration** — "I'm in Tokyo Nov 12-17" sets context for all tasks

---

## 4. SMART DEFAULTS & CONTEXT

The system should be smart about reducing input:

### From the country selector
- Japan selected → show Japanese-relevant services (onsen, izakaya, ryokan)
- France selected → show French-relevant services (boulangerie, pharmacie)
- Auto-set language, phone country code, currency

### From previous bookings
- "You booked at ALBUM salon last time. Book again?" → one tap
- Auto-fill booking name from account
- Remember preferred stylist, doctor, etc.

### From the URL paste
- Paste a salon URL → auto-detect it's a salon, switch to salon form
- Paste a clinic URL → auto-detect it's medical, switch to doctor form
- The URL lookup already extracts business type from categories/metadata

### From the trip dates
- User sets "Tokyo, Nov 12-17" once
- All task date pickers default to that range
- Time picker knows timezone

---

## 5. THE AI CALL SYSTEM — HOW IT ADAPTS PER SERVICE

The current restaurant call flow:
```
AI: "Hello, I'd like to make a reservation for 2 on Friday at 7pm..."
```

For other services, the AI needs different conversation patterns:

### Haircut
```
AI: "Hello, I'd like to book a haircut appointment."
Salon: "When would you like to come?"
AI: "Thursday afternoon, around 2pm if possible."
Salon: "We have 2pm with Tanaka-san or 3pm with Yamada-san."
AI: "2pm with Tanaka-san please. It's for a men's cut."
Salon: "Understood. Your name?"
AI: "The reservation is under [name]. Thank you."
```

### Doctor
```
AI: "Hello, I'm calling to book an appointment for a general checkup."
Clinic: "Is this your first visit?"
AI: "Yes, first visit. The patient is a foreign visitor. 
     Do you have any English-speaking doctors available?"
Clinic: "Dr. Suzuki speaks English. Available Thursday or Friday."
AI: "Thursday would be great. Morning if possible."
```

### Hotel Request
```
AI: "Hello, I'm calling about a reservation under [name], 
     checking in November 12th."
Hotel: "Yes, I can see the reservation."
AI: "Would it be possible to arrange an early check-in, 
     around 11am instead of 3pm?"
Hotel: "We can't guarantee it but we'll note the request."
AI: "Thank you, that's appreciated."
```

### Key: Service-Specific System Prompts

Each task type gets a tailored system prompt:

```typescript
const SERVICE_PROMPTS = {
  restaurant: "You are booking a restaurant table. Key info to confirm: date, time, party size, name...",
  haircut: "You are booking a salon appointment. Key info: service type, date, time, stylist preference, name...",
  doctor: "You are booking a medical appointment. Key info: visit type, preferred date, language needs, name. Be extra polite and clear...",
  hotel: "You are making a request for an existing hotel reservation. Reference the guest name and check-in date first...",
  activity: "You are booking an activity/class. Key info: date, time, number of participants, language preference...",
  custom: "You are making a phone call on behalf of the user. Their request: {freetext}. Be polite, clear, and confirm all details...",
};
```

The conversation AI (GPT-4o) already handles dynamic dialogue — we just need to give it the right context per service type. **No new AI infrastructure needed.**

---

## 6. DATA MODEL

### Current
```
CallRequest {
  businessName, businessPhone, country, language
  objective (generated text)
  detailedNotes, fallbackOptions
  status, outcome, transcript, summary
}
```

### Extended
```
CallRequest {
  // existing fields...
  serviceType: "restaurant" | "haircut" | "doctor" | "spa" | "activity" | "hotel" | "custom"
  queueId: string?        // links to a TaskQueue if part of a batch
  queueOrder: number?     // position in the queue
  structuredInput: JSON    // the form data specific to this service type
}

TaskQueue {
  id, userId
  tripName: "Tokyo Nov 12-17"
  tripCity, tripCountry
  tripStart, tripEnd
  status: "draft" | "running" | "completed"
  tasks: CallRequest[]
}
```

---

## 7. FORM ARCHITECTURE — TECHNICAL

Instead of one giant form, we use a **form registry** pattern:

```typescript
// Each service type registers its form config
const SERVICE_FORMS: Record<ServiceType, ServiceFormConfig> = {
  restaurant: {
    label: "Restaurant",
    icon: "UtensilsCrossed",
    urlLookupEnabled: true,
    fields: [
      { key: "restaurantName", label: "Restaurant", type: "text", required: true },
      { key: "phone", label: "Phone", type: "phone", required: true },
      { key: "partySize", label: "Guests", type: "pills", options: [1,2,3,4,5,6,7,8], default: "2" },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "time", label: "Time", type: "time", required: true },
      { key: "seating", label: "Seating", type: "pills", options: [...], dynamic: true },
      { key: "menuChoice", label: "Menu", type: "pills", dynamic: true, showWhen: "hasMenuTypes" },
    ],
    extraFields: [
      { key: "bookingName", label: "Booking name", type: "text" },
      { key: "occasion", label: "Occasion", type: "text" },
      { key: "dietary", label: "Dietary", type: "text" },
      { key: "specialRequests", label: "Requests", type: "textarea" },
    ],
  },
  
  haircut: {
    label: "Haircut / Salon",
    icon: "Scissors",
    urlLookupEnabled: true,
    fields: [
      { key: "salonName", label: "Salon", type: "text", required: true },
      { key: "phone", label: "Phone", type: "phone", required: true },
      { key: "service", label: "Service", type: "pills", 
        options: ["Cut", "Cut + Color", "Color", "Treatment", "Styling"] },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "time", label: "Time", type: "time", required: true },
    ],
    extraFields: [
      { key: "bookingName", label: "Booking name", type: "text" },
      { key: "stylist", label: "Preferred stylist", type: "text" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "First time, want something short..." },
    ],
  },

  doctor: {
    label: "Doctor / Medical",
    icon: "Stethoscope",
    urlLookupEnabled: true,
    fields: [
      { key: "clinicName", label: "Clinic", type: "text", required: true },
      { key: "phone", label: "Phone", type: "phone", required: true },
      { key: "visitType", label: "Visit", type: "pills",
        options: ["General", "Specific issue", "Dental", "Eye", "Specialist"] },
      { key: "urgency", label: "When", type: "pills",
        options: ["ASAP", "This week", "Flexible"], default: "This week" },
      { key: "language", label: "Language", type: "pills",
        options: ["English required", "Local OK"], default: "English required" },
    ],
    extraFields: [
      { key: "bookingName", label: "Patient name", type: "text" },
      { key: "insurance", label: "Insurance", type: "text" },
      { key: "reason", label: "Reason for visit", type: "textarea" },
    ],
  },

  // ... spa, activity, hotel, custom
};
```

### One form component, many configurations

```tsx
function TaskForm({ serviceType }: { serviceType: ServiceType }) {
  const config = SERVICE_FORMS[serviceType];
  
  return (
    <Card>
      {/* URL paste — same for all types */}
      {config.urlLookupEnabled && <UrlLookupInput />}
      
      {/* Dynamic fields from config */}
      {config.fields.map(field => (
        <DynamicField key={field.key} config={field} />
      ))}
      
      {/* Expandable extras */}
      <ExpandableSection fields={config.extraFields} />
    </Card>
  );
}
```

This means adding a new service type is just **adding a config object** — no new UI code needed.

---

## 8. THE "JUST TELL ME" SHORTCUT

For power users or complex requests, we offer a **conversational input**:

```
┌─────────────────────────────────────────┐
│  💬 Just tell me what you need          │
│                                         │
│  "I need a haircut Thursday afternoon   │
│   in Shibuya, a dinner reservation at   │
│   Sushi Saito Friday 7pm for 2, and     │
│   a doctor who speaks English sometime  │
│   this week"                            │
│                                         │
│  [Let concierge figure it out →]        │
└─────────────────────────────────────────┘
```

GPT parses this into structured tasks:

```json
[
  {
    "type": "haircut",
    "when": "Thursday afternoon",
    "location": "Shibuya",
    "needsPhoneNumber": true
  },
  {
    "type": "restaurant",
    "name": "Sushi Saito",
    "when": "Friday 7pm",
    "guests": 2,
    "needsPhoneNumber": true
  },
  {
    "type": "doctor",
    "requirement": "English-speaking",
    "when": "this week",
    "urgency": "flexible",
    "needsPhoneNumber": true
  }
]
```

The system then:
1. Creates task cards pre-filled with what it understood
2. For tasks missing a phone number → searches for businesses (Google Places API or similar)
3. Shows the user: "I've set up 3 tasks. Review and confirm?"
4. User tweaks anything, hits "Start Concierge"

**This is the ultimate frictionless UX** — one paragraph, multiple bookings.

---

## 9. BUSINESS SEARCH INTEGRATION

Right now the user must provide a phone number. For the concierge to be truly autonomous, it needs to **find businesses** too.

### How it works
1. User says "haircut in Shibuya" (no specific salon)
2. System searches Google Places API for "hair salon Shibuya"
3. Returns top 3-5 results with ratings, photos, phone numbers
4. User picks one (or says "you choose the best rated")
5. Concierge calls and books

### API options
| API | Cost | Data quality |
|---|---|---|
| Google Places API | $17/1000 requests | Excellent — photos, hours, phone, reviews |
| Yelp Fusion | Free (5000/day) | Good — but limited outside US |
| Foursquare | Free tier available | Decent global coverage |
| Apple Maps | Free with Apple dev account | Good in major cities |

**Recommendation**: Google Places for search/discovery, direct URL fetch for when user has a specific link. This covers both "find me a salon" and "book this specific salon" flows.

---

## 10. NOTIFICATION & FOLLOW-UP SYSTEM

The concierge shouldn't just book and disappear. It should follow up:

### During the queue
- Push notification: "Sushi Saito is booked! Friday 7pm, 2 guests ✅"
- Push notification: "Doctor clinic asked for a callback tomorrow morning. I'll retry at 9am."

### Before the appointment
- 24h before: "Reminder: Haircut at ALBUM tomorrow at 2pm. Here's the address + map."
- 1h before: "Your dinner at Sushi Saito is in 1 hour. It's a 12-minute walk from your hotel."

### After the appointment
- "How was your haircut at ALBUM?" → quick rating
- "How was Sushi Saito?" → structured review (food, service, atmosphere)
- This data feeds back into recommendations for future trips

---

## 11. IMPLEMENTATION PRIORITY

### Phase A — Now (restaurant only, current system)
Already built. Refine and get users.

### Phase B — Next (multi-service forms, 2-4 weeks)
1. Add service type selector to the booking page
2. Build the form registry (config-driven forms)
3. Add haircut + custom call service types first (easiest)
4. Build service-specific system prompts for the AI caller

### Phase C — Queue system (4-8 weeks)
1. Build TaskQueue data model
2. Build "My Week" UI
3. Implement sequential call processing (queue runner)
4. Add status updates and notifications

### Phase D — Smart concierge (8-12 weeks)
1. Natural language input → task parsing
2. Business search integration (Google Places)
3. Auto-retry for callbacks
4. Trip context and recommendations

### Phase E — Full autonomy (12+ weeks)
1. "Book my whole trip" — user gives dates + preferences, concierge plans everything
2. Integration with flight/hotel data (pull from email or booking confirmations)
3. Proactive suggestions: "You're in Kyoto on Thursday. These 3 restaurants match your taste."

---

## 12. REVENUE IMPACT

| Feature | Credit model | Revenue impact |
|---|---|---|
| Restaurant only | 1 credit/booking | Baseline |
| Multi-service | 1 credit/call | 2-3x more calls per user |
| Queue/batch | 1 credit/call, batch discount (10 for 8) | Higher ARPU, better retention |
| Business search | Free (included) | Removes friction → more bookings |
| Trip planning | Premium feature: 5 credits for "plan my week" | High-value upsell |
| Auto-retry | Free (goodwill) | Better success rate → more trust → more usage |

### Conservative projection
- Restaurant-only user: 2-3 credits/trip → $5-10
- Multi-service user: 6-10 credits/trip → $15-25
- "Plan my week" user: 10-15 credits/trip → $25-40

**Multi-service 3x's the revenue per user without acquiring new users.**

---

## TL;DR

1. **Don't make users write monologues** — give them task type templates with minimal fields
2. **The queue is the killer feature** — "set up your week, walk away, everything gets booked"
3. **One form component, many configs** — adding new service types is just a config object
4. **Natural language shortcut** for power users — "I need X, Y, and Z this week"
5. **The AI caller already handles any conversation** — we just need service-specific prompts
6. **Business search** removes the "I don't have a phone number" blocker
7. **Implementation is incremental** — each phase adds value independently
