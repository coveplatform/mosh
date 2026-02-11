import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { culturalProfiles } from "@/lib/cultural-layer";
import { initiateCall } from "@/lib/call-engine";

/**
 * Build a call objective from a free-text task description.
 * The AI agent uses this as its mission during the call.
 */
function buildTaskObjective(body: {
  description: string;
  bookingName?: string;
  priority?: string;
}): string {
  let objective = body.description.trim();

  if (body.bookingName) {
    objective += ` The caller's name is "${body.bookingName}".`;
  }

  if (body.priority === "urgent") {
    objective += ` This is urgent — communicate appropriate urgency.`;
  }

  // NOTE: Do NOT append summary instructions to the objective — they get spoken aloud by the AI.
  // Post-call summaries are handled separately by the analysisPlan (Vapi) or generateCallSummary (Twilio).

  return objective;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { description, businessName, phone, country, priority, bookingName } = body;

    if (!description || !phone) {
      return NextResponse.json(
        { error: "Please describe what you need and provide a phone number" },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide more detail about what you need" },
        { status: 400 }
      );
    }

    const creditCost = 1;

    if (user.credits < creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 1 credit but have ${user.credits}. Upgrade your plan for more.`,
        },
        { status: 402 }
      );
    }

    const profile = culturalProfiles[country];
    const language = profile?.language || "Unknown";

    const objective = buildTaskObjective({ description, bookingName, priority });

    // Build detail notes
    const detailParts: string[] = [];
    if (priority === "urgent") detailParts.push("Priority: URGENT");
    if (bookingName) detailParts.push(`Name: ${bookingName}`);
    const detailedNotes = detailParts.length > 0 ? detailParts.join(" | ") : null;

    const culturalNotes = profile
      ? JSON.stringify({
          etiquette: profile.etiquetteNotes,
          tips: profile.tips,
          callingHours: profile.callingHours,
        })
      : null;

    const callRequest = await prisma.callRequest.create({
      data: {
        userId: user.id,
        tier: priority === "urgent" ? "complex" : "simple",
        businessName: businessName || "Unknown business",
        businessPhone: phone,
        country: profile?.country || country,
        language,
        objective,
        detailedNotes,
        tonePreference: "polite",
        constraints: null,
        fallbackOptions: null,
        culturalNotes,
        creditsUsed: creditCost,
        status: "pending",
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
        description: `Task: ${businessName || "Call"} (${profile?.country || country})`,
        callRequestId: callRequest.id,
      },
    });

    // Auto-initiate the call (fire and forget — don't block the response)
    initiateCall(callRequest.id).catch((err) => {
      console.error("Auto-initiate call failed:", err);
    });

    return NextResponse.json(callRequest, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
