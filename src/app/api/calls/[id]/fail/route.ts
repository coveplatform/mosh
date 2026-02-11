import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * Manually mark a stuck call as failed and refund credits.
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

    const callRequest = await prisma.callRequest.findFirst({
      where: { id, userId: user.id },
    });

    if (!callRequest) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (callRequest.status !== "in_progress") {
      return NextResponse.json({ error: "Call is not in progress" }, { status: 400 });
    }

    // Mark as failed
    await prisma.callRequest.update({
      where: { id },
      data: {
        status: "failed",
        outcome: "failed",
        summary: "Call was manually marked as failed (stuck or unresponsive).",
        completedAt: new Date(),
      },
    });

    // Refund credits
    await prisma.user.update({
      where: { id: callRequest.userId },
      data: { credits: { increment: callRequest.creditsUsed } },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: callRequest.userId,
        amount: callRequest.creditsUsed,
        type: "refund",
        description: `Refund — call to ${callRequest.businessName} manually failed`,
        callRequestId: callRequest.id,
      },
    });

    const updated = await prisma.callRequest.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Mark call failed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
