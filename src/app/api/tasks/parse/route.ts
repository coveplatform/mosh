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
          content: `You are Mosh, an AI assistant that handles tasks for users. A user living in ${country || "Japan"} wants you to help them with a task — either making a phone call or sending an email on their behalf.
${taskType ? `\nIMPORTANT: The user has explicitly chosen "${taskType}" as their task type. Respect this choice — set suggestedTaskType to "${taskType}" and ask for ${taskType === "email" ? "an email address (not a phone number)" : "a phone number (not an email address)"} if contact info is missing.\n` : ""}
Analyze their request and return a JSON object with:

{
  "summary": "A one-sentence restatement of what they need, in clear language",
  "suggestedTaskType": "${taskType || "call or email"} — ${taskType ? `use '${taskType}' as the user chose this.` : "suggest 'email' if the request is formal (complaints, applications, inquiries to businesses that likely prefer email) or if the user mentions email. Otherwise suggest 'call'."}",
  "businessName": "The business/person to contact (or null if not specified)",
  "phoneProvided": true/false,
  "phone": "extracted phone number or null",
  "emailProvided": true/false,
  "email": "extracted email address or null",
  "category": "one of: medical, restaurant, maintenance, government, finance, delivery, salon, school, utility, other",
  "details": {
    "extracted": { ... any key details already mentioned (date, time, name, account number, etc.) },
    "missing": [
      {
        "key": "field_name",
        "question": "A friendly, concise question to ask the user",
        "required": true/false,
        "type": "text|phone|email|select",
        "options": ["option1", "option2"] // only for select type
      }
    ]
  },
  "fallbackQuestion": "A question about what to do if the primary request can't be fulfilled (or null if not applicable)",
  "fallbackOptions": ["option1", "option2", "option3"] // suggested fallback choices
}

RULES:
- For CALL tasks: always ask for a phone number if not provided — it's required.
- For EMAIL tasks: always ask for an email address if not provided — it's required.
- If the business is vague (e.g. "a doctor", "a salon"), ask which specific one OR offer to help find one.
- For appointments/bookings, ask about flexibility if time was mentioned (e.g. "If 6pm isn't available, should Mosh try a nearby time?").
- For complaints/disputes, ask for account numbers or reference numbers if relevant.
- Keep questions SHORT and friendly. Max 3-4 missing fields.
- Don't ask for things that are obvious or unnecessary.
- "required" should be true only for contact info (phone/email) and business identity. Other details are nice-to-have.`,
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
