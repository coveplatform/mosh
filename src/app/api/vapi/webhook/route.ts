import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/vapi/webhook
 *
 * Handles webhook events from Vapi. Key events:
 * - end-of-call-report: Call completed — contains transcript, recording, summary, structured data
 * - status-update: Call status changes (queued, ringing, in-progress, ended)
 * - hang: Voicemail or no-answer detected
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the webhook is from Vapi using a shared secret
    const vapiSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (vapiSecret) {
      const authHeader = req.headers.get("x-vapi-secret");
      if (authHeader !== vapiSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const messageType = message.type;

    // Extract callRequestId from assistant metadata
    const callRequestId =
      message.call?.assistant?.metadata?.callRequestId ||
      message.call?.assistantOverrides?.metadata?.callRequestId ||
      message.metadata?.callRequestId ||
      null;

    console.info(`[Vapi webhook] type=${messageType} callRequestId=${callRequestId}`);

    // ─── STATUS UPDATE ───
    if (messageType === "status-update") {
      const status = message.status;

      if (callRequestId) {
        const updateData: Record<string, unknown> = {
          twilioStatus: status, // Reusing field for Vapi status
        };

        if (status === "in-progress") {
          updateData.startedAt = new Date();
        }

        await prisma.callRequest.update({
          where: { id: callRequestId },
          data: updateData,
        });
      }

      return NextResponse.json({ ok: true });
    }

    // ─── END OF CALL REPORT ───
    if (messageType === "end-of-call-report") {
      if (!callRequestId) {
        console.warn("[Vapi webhook] end-of-call-report without callRequestId");
        return NextResponse.json({ ok: true });
      }

      const call = message.call || message;

      // Extract transcript
      const transcript = message.artifact?.transcript ||
        call.artifact?.transcript ||
        "";

      // Extract recording URL
      const recordingUrl = message.artifact?.recordingUrl ||
        call.artifact?.recordingUrl ||
        message.artifact?.recording?.combinedUrl ||
        null;

      // Extract Vapi's AI-generated summary
      const summary = message.analysis?.summary ||
        call.analysis?.summary ||
        "";

      // Extract structured data (outcome, actionItems, confirmed)
      const structuredData = message.analysis?.structuredData ||
        call.analysis?.structuredData ||
        {};

      // Determine outcome from structured data or ended reason
      const endedReason = call.endedReason || message.endedReason || "";
      let outcome = structuredData.outcome || "unknown";

      // Map Vapi ended reasons to our outcome categories
      if (endedReason === "voicemail" || endedReason === "machine-detected") {
        outcome = "voicemail";
      } else if (endedReason === "customer-busy" || endedReason === "customer-did-not-answer") {
        outcome = "no_answer";
      } else if (endedReason === "call-start-error-neither-assistant-nor-server-set" ||
                 endedReason.startsWith("call-start-error")) {
        outcome = "failed";
      }

      // Calculate duration
      const startedAt = call.startedAt ? new Date(call.startedAt) : null;
      const endedAt = call.endedAt ? new Date(call.endedAt) : null;
      const durationSeconds = startedAt && endedAt
        ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
        : null;

      // Build full transcript with duration
      let fullTranscript = transcript;
      if (durationSeconds !== null) {
        fullTranscript += `\n\n[Call duration: ${durationSeconds}s]`;
      }
      if (endedReason) {
        fullTranscript += `\n[Ended: ${endedReason}]`;
      }

      // Determine final status
      const isSuccess = outcome === "success" || outcome === "partial";
      const finalStatus = isSuccess ? "completed" : (outcome === "failed" ? "failed" : "completed");

      // Update the call request
      await prisma.callRequest.update({
        where: { id: callRequestId },
        data: {
          status: finalStatus,
          outcome,
          transcript: fullTranscript,
          summary: summary || `Call ended: ${endedReason}`,
          recordingUrl,
          completedAt: endedAt || new Date(),
          twilioStatus: "completed",
        },
      });

      // Refund credit if the call never connected (voicemail, no answer, failed)
      const shouldRefund = ["voicemail", "no_answer", "failed"].includes(outcome);
      if (shouldRefund) {
        const callRequest = await prisma.callRequest.findUnique({
          where: { id: callRequestId },
          select: { userId: true },
        });

        if (callRequest) {
          await prisma.user.update({
            where: { id: callRequest.userId },
            data: { credits: { increment: 1 } },
          });

          await prisma.creditTransaction.create({
            data: {
              userId: callRequest.userId,
              amount: 1,
              type: "refund",
              description: `Credit refunded — call ${outcome === "voicemail" ? "went to voicemail" : outcome === "no_answer" ? "was not answered" : "failed to connect"}`,
              callRequestId,
            },
          });
        }
      }

      console.info(`[Vapi webhook] Call ${callRequestId} completed: outcome=${outcome}, duration=${durationSeconds}s`);
      return NextResponse.json({ ok: true });
    }

    // ─── HANG (voicemail/no-answer) ───
    if (messageType === "hang") {
      if (callRequestId) {
        await prisma.callRequest.update({
          where: { id: callRequestId },
          data: {
            status: "failed",
            outcome: "no_answer",
            summary: "Call was not answered or went to voicemail.",
            completedAt: new Date(),
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // ─── SPEECH UPDATE (optional — for real-time transcript updates) ───
    if (messageType === "speech-update" || messageType === "transcript") {
      // We could update the transcript in real-time here for the dashboard
      // For now, we rely on the end-of-call-report for the final transcript
      return NextResponse.json({ ok: true });
    }

    // Unknown event type — acknowledge it
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Vapi webhook] Error:", error);
    // Always return 200 to prevent Vapi from retrying
    return NextResponse.json({ ok: true });
  }
}
