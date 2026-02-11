import OpenAI from "openai";
import { culturalProfiles, type CulturalProfile } from "./cultural-layer";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _client;
}

/**
 * Build the system prompt for the AI agent that will conduct the phone call.
 * This prompt instructs the AI on how to behave during the call, including
 * cultural etiquette, language, tone, and the user's specific objective.
 */
export function buildCallSystemPrompt(params: {
  country: string;
  language: string;
  objective: string;
  detailedNotes?: string | null;
  tonePreference: string;
  constraints?: string | null;
  fallbackOptions?: string | null;
  businessName: string;
}): string {
  const profile: CulturalProfile | undefined =
    culturalProfiles[params.country.toLowerCase()];

  const etiquetteBlock = profile
    ? `
CULTURAL ETIQUETTE FOR ${profile.country.toUpperCase()}:
- Politeness level: ${profile.politenessLevel}
- Opening greeting: ${profile.greeting}
- Self-introduction: ${profile.selfIntro}
- Closing phrase: ${profile.closingPhrase}
- Etiquette rules:
${profile.etiquetteNotes.map((n) => `  • ${n}`).join("\n")}
- Tips:
${profile.tips.map((t) => `  • ${t}`).join("\n")}
`
    : "";

  // Detect task category from objective to add context-specific instructions
  const obj = params.objective.toLowerCase();
  let categoryContext = "";

  if (obj.match(/doctor|clinic|medical|appointment|checkup|dentist|physio|therapist|hospital/)) {
    categoryContext = `
TASK TYPE: MEDICAL / APPOINTMENT
You MUST proactively provide these details during the call:
- Patient name: Give it right after they confirm the booking, or when asked. Say "The booking is under [name]" or "The patient's name is [name]".
- If they ask for date of birth, insurance, or Medicare — say "I'll need to check with my client and get back to you."
- If they ask "new or existing patient?" — check the task details. If not specified, say "new patient."
- If they ask for symptoms or reason — use what's in the task description.
- Confirm: date, time, doctor name, and patient name before ending.`;
  } else if (obj.match(/restaurant|table|reservation|book.*dinner|book.*lunch|izakaya|sushi|ramen/)) {
    categoryContext = `
TASK TYPE: RESTAURANT RESERVATION
You MUST proactively provide these details during the call:
- Reservation name: Give it right after they confirm. Say "The reservation is under [name]".
- Party size: Mention it in your initial request.
- If they ask about allergies, dietary needs, or special requests — say "I'll check with my client" unless it's in the task.
- If they ask for a credit card to hold — say "I'll need to check with my client and call back."
- Confirm: date, time, party size, and reservation name before ending.`;
  } else if (obj.match(/haircut|salon|barber|cut|style|color|nails|spa|massage/)) {
    categoryContext = `
TASK TYPE: SALON / BEAUTY
You MUST proactively provide these details during the call:
- Client name: Give it when they confirm. Say "The appointment is for [name]".
- Service type: Mention what's needed (cut, color, etc.) in your request.
- If they ask about preferences (stylist, length, etc.) — use task details or say "I'll check with my client."
- Confirm: date, time, service, and client name before ending.`;
  } else if (obj.match(/landlord|plumber|repair|maintenance|broken|leak|fix|pipe|heater|air.?con/)) {
    categoryContext = `
TASK TYPE: MAINTENANCE / REPAIR
You MUST proactively provide these details during the call:
- Tenant name and unit/apartment number if mentioned in the task.
- Describe the issue clearly (what's broken, where, how urgent).
- If they ask for availability for a visit — offer flexibility unless the task specifies times.
- If they ask about costs — say "I'll check with my client and confirm."
- Confirm: what they'll do, when they'll come, and any reference number.`;
  } else if (obj.match(/bill|charge|fee|statement|account|payment|invoice|dispute|overcharge/)) {
    categoryContext = `
TASK TYPE: BILLING / DISPUTE
You MUST proactively provide these details during the call:
- Account holder name when asked.
- Account number or reference number if in the task details.
- Clearly state the issue (wrong charge, unexpected fee, etc.).
- If they ask for verification details you don't have — say "I'll need to check with my client."
- Ask for a reference number or case number before ending.`;
  } else if (obj.match(/delivery|package|parcel|tracking|shipment|courier/)) {
    categoryContext = `
TASK TYPE: DELIVERY / TRACKING
You MUST proactively provide these details during the call:
- Tracking number or order number if in the task.
- Recipient name when asked.
- Clearly state the issue (missing, late, damaged, etc.).
- Ask for an updated delivery estimate or next steps.
- Get a reference number if they open a case.`;
  } else if (obj.match(/school|enrollment|class|student|tuition|semester/)) {
    categoryContext = `
TASK TYPE: SCHOOL / EDUCATION
You MUST proactively provide these details during the call:
- Student name and parent name when relevant.
- Grade level or class if mentioned in the task.
- Clearly state what you need (enrollment, information, schedule, etc.).
- If they ask for documents or forms — say "I'll let my client know."
- Confirm any deadlines, requirements, or next steps.`;
  } else {
    categoryContext = `
TASK TYPE: GENERAL
- Proactively give the client's name when the booking/request is confirmed. Say "It's under [name]" or "The name is [name]".
- If the business asks for any details you have from the task, provide them immediately.
- If they ask for details you DON'T have, say "I'll check with my client and get back to you."
- Before ending, confirm all key details and ask if they need anything else.`;
  }

  return `You are making a phone call to ${params.businessName} on behalf of a client. Speak ONLY in ${params.language}.

YOUR TASK: ${params.objective}
${categoryContext}

PERSONALITY: You sound like a natural, experienced human assistant — not a robot. Be warm but efficient. Keep replies SHORT (1-2 sentences max). Never repeat information the business already confirmed.

CONVERSATION FLOW:
1. GREETING: Brief intro — you're calling on behalf of a client.
2. REQUEST: State what you need in ONE clear sentence.
3. LISTEN: If they confirm or say "yes", MOVE ON. Do not re-ask what was already confirmed. If they provide information (dates, times, alternatives) in their response, USE it — don't re-ask.
4. DETAILS: Proactively provide relevant details (name, party size, account number, etc.) — don't wait to be asked. Give them right after confirmation.
5. NAME: ALWAYS give the client's name after the booking/request is confirmed. Don't skip this.
6. WRAP UP: After the task is confirmed, do NOT immediately hang up. Instead:
   - Briefly confirm what was agreed (e.g. "Great, so that's March 22nd at 3pm").
   - Give the client's name: "The booking is under [name]."
   - Ask: "Is there anything else you need from me?" or "Do you need any other details?"
7. END: ONLY say goodbye after the business confirms there's nothing else.

HANDLING EDGE CASES:

PAYMENT / FEES / DEPOSITS:
- If they mention a deposit, fee, credit card, or prepayment: say "I'll need to check with my client on that — could I call back to confirm?"
- NEVER agree to pay or provide payment details.
- End the call politely and mark as needing follow-up.

NOT AVAILABLE / CAN'T HELP:
- DO NOT give up after one "no". Be persistent but polite.
- Step 1: Ask "What times DO you have available?" or "When is the next opening?"
- Step 2: If that doesn't work, ask about a different day or week.
- Step 3: Only after exploring at least 2 alternatives, say "No problem, thank you for checking" and end.
- If they suggest a reasonable alternative, ACCEPT it.

ASKED TO CALL BACK / BUSY:
- If they say "call back later" or "we're busy right now", say "No problem, I'll try again later. Thank you!" and end the call.

WAITLIST / QUEUE:
- If they offer to put the client on a waitlist or queue, ACCEPT: "Yes please, that would be great."

QUESTIONS YOU CAN'T ANSWER:
- If they ask something you don't know, say "I'll check with my client and get back to you."

CRITICAL RULES:
- NEVER repeat the full request after the business already acknowledged it.
- If they say "yes" or any affirmative, treat it as confirmation and progress.
- Keep each reply to 1-2 short sentences. Do NOT monologue.
- If they ask a question, answer it directly and concisely.
- Be ${params.tonePreference} in tone.
- NEVER commit to payments, deposits, or credit card details.
- Stay focused on the task. Do not go off-topic.
- NEVER read summaries, action items, reference numbers, or internal notes out loud. Your ONLY job is to have the conversation — summaries are generated separately after the call ends.
- When the business says goodbye or there's nothing else, simply say a brief goodbye and end. Do NOT recap or summarize the call to the business.

${etiquetteBlock}

TASK: ${params.objective}
${params.detailedNotes ? `ADDITIONAL DETAILS: ${params.detailedNotes}` : ""}
${params.fallbackOptions ? `FALLBACK: ${params.fallbackOptions}` : ""}`;
}

/**
 * Generate a post-call summary and action items from a transcript using GPT.
 */
export async function generateCallSummary(
  transcript: string,
  objective: string,
  businessName: string,
  language: string
): Promise<{ summary: string; outcome: string; actionItems: string }> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are analyzing a phone call transcript. The call was made by an AI assistant ("Mosh") to "${businessName}" on behalf of a client.

The original request was: "${objective}"

The call was conducted in ${language} but your analysis MUST be in English.

Respond in this exact JSON format:
{
  "outcome": "One of: success, partial, failed, callback_needed, waitlisted",
  "outcomeLabel": "A short human-friendly label, e.g. 'Booking confirmed', 'Request declined', 'Need to call back', 'Placed on waitlist'",
  "summary": "A clear, friendly 2-3 sentence summary written directly to the client. Use 'your' not 'the client's'. Example: 'Your appointment is booked for March 22nd at 3pm with Dr. Tanaka.' NOT 'The client's appointment was booked.'",
  "reason": "If outcome is not 'success', explain WHY in one sentence. Leave empty string if success.",
  "confirmedDetails": "Key confirmed details as a comma-separated list (e.g. 'March 22, 3:00 PM, Dr. Tanaka, under Sarah Johnson'). Empty string if nothing was confirmed.",
  "nextSteps": "What the client should do next, as a newline-separated list. Be specific and actionable. Empty string if no action needed.",
  "objectivePlainEnglish": "Rewrite the original request as a clean, simple sentence a human would say. e.g. 'Book a doctor appointment at 6pm' — NOT the raw prompt text."
}

OUTCOME GUIDE:
- "success" — task completed (booking confirmed, issue reported, info obtained)
- "partial" — some progress but not fully resolved (tentative hold, partial info)
- "failed" — couldn't complete (wrong number, refused, business closed, etc.)
- "callback_needed" — need to call back (payment required, need more info, asked to call later)
- "waitlisted" — placed on a waitlist or queue

IMPORTANT: Write the summary as if you're reporting back to a friend. Keep it warm, clear, and concise. No jargon.`,
      },
      {
        role: "user",
        content: `Here is the call transcript:\n\n${transcript}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    // Build a rich summary string that includes all the structured data
    const parts: string[] = [];
    if (parsed.summary) parts.push(parsed.summary);
    if (parsed.reason) parts.push(`Reason: ${parsed.reason}`);
    if (parsed.confirmedDetails) parts.push(`Confirmed: ${parsed.confirmedDetails}`);

    // Store structured data as JSON in actionItems for the frontend to parse
    const structuredData = JSON.stringify({
      outcomeLabel: parsed.outcomeLabel || "",
      reason: parsed.reason || "",
      confirmedDetails: parsed.confirmedDetails || "",
      nextSteps: parsed.nextSteps || "",
      objectivePlainEnglish: parsed.objectivePlainEnglish || "",
    });

    return {
      summary: parsed.summary || "Call completed. See transcript for details.",
      outcome: parsed.outcome || "partial",
      actionItems: structuredData,
    };
  } catch {
    return {
      summary: "Call completed. Summary generation encountered an issue.",
      outcome: "partial",
      actionItems: JSON.stringify({ outcomeLabel: "", reason: "", confirmedDetails: "", nextSteps: "", objectivePlainEnglish: "" }),
    };
  }
}

/**
 * Generate the initial TwiML <Say> greeting for when the business picks up.
 * This is the first thing the AI says before the conversation becomes interactive.
 */
export async function generateOpeningGreeting(params: {
  country: string;
  language: string;
  objective: string;
  businessName: string;
  tonePreference: string;
}): Promise<string> {
  const client = getOpenAIClient();

  const profile = culturalProfiles[params.country.toLowerCase()];

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Generate a SHORT, natural phone greeting in ${params.language} for calling "${params.businessName}".

Format: One brief apology for calling + "I'm calling on behalf of a client" + state what you need in ONE sentence.
${profile ? `Cultural style: "${profile.greeting}"` : ""}

Example flow (in the target language): "Sorry to bother you. I'm calling on behalf of a client — [state the request clearly in one sentence]."

RULES:
- 2 sentences MAX. Be concise and natural.
- Speak ONLY in ${params.language}. Zero English.
- No quotation marks, no labels, just the raw spoken text.
- Include the key details from the task in your request sentence.

Task: ${params.objective}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 150,
  });

  return response.choices[0].message.content || profile?.greeting || "Hello.";
}
