import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { initiateCall } from "@/lib/call-engine";
import { culturalProfiles } from "@/lib/cultural-layer";

/**
 * POST /api/calls/[id]/simulate
 *
 * If Twilio credentials are configured → places a REAL call via Twilio + OpenAI.
 * If not configured → falls back to a demo simulation so the app still works.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const call = await prisma.callRequest.findFirst({
      where: { id, userId: user.id },
    });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (call.status !== "pending") {
      return NextResponse.json(
        { error: "Call has already been processed" },
        { status: 400 }
      );
    }

    // --- REAL CALL MODE ---
    const vapiConfigured =
      process.env.VAPI_API_KEY &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_PHONE_NUMBER &&
      !process.env.VAPI_API_KEY.startsWith("your-");

    const openaiConfigured =
      process.env.OPENAI_API_KEY &&
      !process.env.OPENAI_API_KEY.startsWith("your-");

    if (vapiConfigured && openaiConfigured) {
      const result = await initiateCall(id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to initiate call" },
          { status: 500 }
        );
      }

      // Return the updated call (now in_progress)
      const updatedCall = await prisma.callRequest.findUnique({
        where: { id },
      });

      return NextResponse.json({
        ...updatedCall,
        _mode: "live",
        _message: "Real call initiated via Twilio. The call is now in progress.",
      });
    }

    // --- DEMO SIMULATION MODE ---
    const countryKey = Object.keys(culturalProfiles).find(
      (k) => culturalProfiles[k].country.toLowerCase() === call.country.toLowerCase()
    ) || "japan";

    const profile = culturalProfiles[countryKey] || culturalProfiles["japan"];

    const transcript = [
      `[Call initiated to ${call.businessName}]`,
      `[MODE: Demo Simulation — configure Twilio & OpenAI for real calls]`,
      "",
      `Agent: ${profile.greeting}`,
      `Agent: ${profile.selfIntro}`,
      "",
      `Business: はい、${call.businessName}でございます。`,
      "",
      `Agent: ${profile.commonPhrases.availability}`,
      `Agent: [Conveying user's request: ${call.objective}]`,
      "",
      `Business: 少々お待ちください。確認いたします。`,
      `Business: [Checking availability...]`,
      "",
      `Business: はい、ご予約可能でございます。`,
      "",
      `Agent: ${profile.commonPhrases.thankyou}`,
      `Agent: ${profile.commonPhrases.confirmation}`,
      "",
      `Business: はい、確認いたしました。`,
      "",
      `Agent: ${profile.closingPhrase}`,
      "",
      `[Call ended — Duration: 3m 42s]`,
    ].join("\n");

    const summary = `[DEMO] Successfully contacted ${call.businessName}. The request regarding "${call.objective}" was communicated clearly. The business confirmed availability and the request has been processed.`;

    const actionItems = [
      "Reservation/request confirmed",
      "No further action needed from your side",
      "Consider arriving 5-10 minutes early",
      "Contact us if you need to modify or cancel",
    ].join("\n");

    const updatedCall = await prisma.callRequest.update({
      where: { id },
      data: {
        status: "completed",
        transcript,
        summary,
        outcome: "success",
        actionItems,
        startedAt: new Date(Date.now() - 222000),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...updatedCall,
      _mode: "demo",
      _message: "Demo simulation. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and OPENAI_API_KEY in .env for real calls.",
    });
  } catch (error) {
    console.error("Call execution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
