import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { initiateCall } from "@/lib/call-engine";

/**
 * POST /api/tasks/[id]/call
 *
 * Triggers the actual phone call (via Vapi) for a pending task.
 * Called from the task detail page after the task is created.
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

    const callRequest = await prisma.callRequest.findUnique({
      where: { id },
    });

    if (!callRequest) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (callRequest.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (callRequest.status !== "pending" && callRequest.status !== "failed") {
      return NextResponse.json(
        { error: `Task is already ${callRequest.status}` },
        { status: 400 }
      );
    }

    // Reset status to pending for retry
    if (callRequest.status === "failed") {
      await prisma.callRequest.update({
        where: { id },
        data: { status: "pending", outcome: null, summary: null, completedAt: null },
      });
    }

    // Check if this is an email task (taskType field may exist on some records)
    if ((callRequest as Record<string, unknown>).taskType === "email") {
      return NextResponse.json(
        { error: "This is an email task, not a call task" },
        { status: 400 }
      );
    }

    // Initiate the call via Vapi
    const result = await initiateCall(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to initiate call" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: result.vapiCallId,
    });
  } catch (error) {
    console.error("Call initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
