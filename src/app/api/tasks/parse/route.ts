import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

/**
 * POST /api/tasks/parse
 *
 * Takes a free-text task description and uses GPT to:
 * 1. Understand what the user wants
 * 2. Extract any details already provided
 * 3. Identify what's missing and generate smart follow-up questions
 */
export async function POST(req: NextRequest) {
  try {
    const { description, country, taskType } = await req.json();

    if (!description || description.trim().length < 5) {
      return NextResponse.json(
        { error: "Please describe what you need" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Mosh, an AI assistant that makes phone calls on behalf of users. A user living in ${country || "Japan"} wants you to call a business for them.

Analyze their request and return a JSON object with:

{
  "summary": "A one-sentence restatement of what they need, in clear language",
  "suggestedTaskType": "call",
  "businessName": "The business/person to contact (or null if not specified)",
  "phoneProvided": true/false,
  "phone": "extracted phone number or null",
  "category": "one of: medical, restaurant, maintenance, government, finance, delivery, salon, school, utility, other",
  "details": {
    "extracted": { ... any key details already mentioned (date, time, name, account number, etc.) },
    "missing": [
      {
        "key": "field_name",
        "question": "A friendly, concise question to ask the user",
        "required": true/false,
        "type": "text|phone|select",
        "options": ["option1", "option2"] // only for select type
      }
    ]
  },
  "fallbackQuestion": "A question about what to do if the primary request can't be fulfilled (or null if not applicable)",
  "fallbackOptions": ["option1", "option2", "option3"] // suggested fallback choices
}

RULES FOR GENERATING QUESTIONS:
1. NEVER combine two different questions into one. Each question must ask about ONE thing only.
   BAD: "Which doctor or clinic would you like to book an appointment with?"
   GOOD: Two separate fields — one for "Name of the doctor or clinic" and one for "Phone number"

2. ALWAYS ask for the business phone number separately — it is always required. Hint that the user can paste a link to the business website or Google Maps listing.
   Example question for phone: "Phone number of the business (you can also paste a Google Maps or website link)"

3. If the business name is vague (e.g. "a doctor", "a salon", "a restaurant"), ask for the specific name separately from the phone number.
   - Business name field: required, type "text"
   - Phone number field: required, type "phone"

4. Think logically about what information the business will need during the call:
   - Medical: patient name, preferred date/time, reason for visit
   - Restaurant: party size, date/time, seating preference
   - Maintenance: what's broken, urgency, address/unit number
   - Salon: service type, preferred date/time
   - General: keep it minimal — only ask what's truly needed

5. For appointments/bookings, ask about date and time as SEPARATE fields if neither was mentioned.

6. Keep questions SHORT and friendly. Max 5 missing fields total.
7. Don't ask for things that are obvious or unnecessary.
8. "required" should be true for: phone number, business name (if not provided). Other details are nice-to-have (required: false).
9. For fallback questions, ask what to do if the primary request can't be fulfilled (e.g. "If this time isn't available, should Mosh try a nearby time?").`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Task parse error:", error);
    return NextResponse.json(
      { error: "Failed to analyze task" },
      { status: 500 }
    );
  }
}
