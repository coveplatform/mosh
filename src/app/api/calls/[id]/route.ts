import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(
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

    return NextResponse.json(call);
  } catch (error) {
    console.error("Get call error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calls/[id]
 *
 * Deletes a task. For pending/queued tasks, refunds the credit.
 * For in_progress tasks, marks as cancelled first.
 */
export async function DELETE(
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
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Refund credit for pending tasks that never ran
    if (call.status === "pending" && call.creditsUsed > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: call.creditsUsed } },
      });

      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: call.creditsUsed,
          type: "refund",
          description: `Refund — cancelled task for ${call.businessName}`,
          callRequestId: call.id,
        },
      });
    }

    // Delete related credit transactions first, then the call request
    await prisma.creditTransaction.deleteMany({
      where: { callRequestId: call.id },
    });

    await prisma.callRequest.delete({
      where: { id: call.id },
    });

    return NextResponse.json({ ok: true, refunded: call.status === "pending" });
  } catch (error) {
    console.error("Delete call error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
