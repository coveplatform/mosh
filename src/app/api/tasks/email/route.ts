import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getOpenAIClient } from "@/lib/openai";
import { culturalProfiles } from "@/lib/cultural-layer";
import { buildEmailHtml } from "@/lib/email-template";

/**
 * POST /api/tasks/email
 *
 * Two modes:
 * - action: "draft" → GPT generates email draft in target language
 * - action: "send"  → Sends the approved email and creates the task record
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // ─── DRAFT MODE ───
    if (action === "draft") {
      const { description, businessName, businessEmail, country, bookingName } = body;

      if (!description || description.trim().length < 10) {
        return NextResponse.json(
          { error: "Please provide more detail about what you need" },
          { status: 400 }
        );
      }

      const profile = culturalProfiles[country];
      const language = profile?.language || "English";

      const openai = getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Mosh, an AI assistant that drafts professional emails on behalf of users.

The user wants to send an email to "${businessName || "a business"}" (${businessEmail || "email TBD"}).
The email should be written in ${language}.
${profile ? `Cultural context: ${profile.country} — politeness level: ${profile.politenessLevel}` : ""}

USER'S REQUEST: ${description}
${bookingName ? `The user's name is: ${bookingName}` : ""}

Generate a professional, culturally appropriate email. Return JSON:
{
  "subject": "Email subject line in ${language}",
  "body": "Full email body in ${language}. Include greeting, main request, and polite closing. Use appropriate formality for the culture.",
  "subjectEnglish": "English translation of the subject",
  "bodyEnglish": "English translation of the body so the user can review it"
}

RULES:
- Write the actual email in ${language}, not English (unless the target language IS English).
- Be professional but warm — match the cultural tone.
- Include all relevant details from the user's request.
- If it's a booking/appointment request, include preferred dates/times.
- If it's a complaint/inquiry, be clear but polite.
- Keep it concise — no unnecessary filler.
- Sign off with the user's name if provided.`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1000,
      });

      const draft = JSON.parse(response.choices[0].message.content || "{}");
      return NextResponse.json(draft);
    }

    // ─── SEND MODE ───
    if (action === "send") {
      const {
        description,
        businessName,
        businessEmail,
        country,
        bookingName,
        emailSubject,
        emailBody,
      } = body;

      if (!businessEmail) {
        return NextResponse.json(
          { error: "Email address is required" },
          { status: 400 }
        );
      }

      if (!emailSubject || !emailBody) {
        return NextResponse.json(
          { error: "Email subject and body are required" },
          { status: 400 }
        );
      }

      const creditCost = 1;

      if (user.credits < creditCost) {
        return NextResponse.json(
          {
            error: `Insufficient credits. You need 1 credit but have ${user.credits}.`,
          },
          { status: 402 }
        );
      }

      const profile = culturalProfiles[country];
      const language = profile?.language || "English";

      // Send the email via Resend (or fallback to logging)
      let emailMessageId = null;
      let sendSuccess = false;

      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || "Mosh <noreply@mosh.app>",
              to: [businessEmail],
              reply_to: user.replyToEmail || user.email,
              subject: emailSubject,
              text: emailBody,
              html: buildEmailHtml({
                subject: emailSubject,
                body: emailBody,
                businessName: businessName || businessEmail,
                senderName: bookingName || user.name,
                language,
              }),
            }),
          });

          if (resendRes.ok) {
            const resendData = await resendRes.json();
            emailMessageId = resendData.id;
            sendSuccess = true;
          } else {
            const errData = await resendRes.json().catch(() => ({}));
            console.error("Resend error:", errData);
          }
        } catch (err) {
          console.error("Resend send failed:", err);
        }
      } else {
        // No Resend key — dev mode fallback
        console.warn("[Email] RESEND_API_KEY not set — email not actually sent (dev mode)");
        sendSuccess = true;
        emailMessageId = `dev-${Date.now()}`;
      }

      if (!sendSuccess) {
        return NextResponse.json(
          { error: "Failed to send email. Please try again." },
          { status: 500 }
        );
      }

      // Create the task record
      const task = await prisma.callRequest.create({
        data: {
          userId: user.id,
          taskType: "email",
          tier: "simple",
          businessName: businessName || "Unknown business",
          businessPhone: "",
          businessEmail,
          country: profile?.country || country || "Unknown",
          language,
          objective: description,
          detailedNotes: bookingName ? `Name: ${bookingName}` : null,
          tonePreference: "polite",
          emailSubject,
          emailBody,
          emailSentAt: new Date(),
          emailMessageId,
          status: "completed",
          outcome: "success",
          summary: `Email sent to ${businessName || businessEmail} regarding: ${description.substring(0, 100)}`,
          actionItems: "Wait for a reply. Check your inbox for responses.",
          completedAt: new Date(),
          creditsUsed: creditCost,
        },
      });

      // Deduct credits
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      });

      // Record transaction
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -creditCost,
          type: "usage",
          description: `Email: ${businessName || businessEmail}`,
          callRequestId: task.id,
        },
      });

      return NextResponse.json(task, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Email task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
