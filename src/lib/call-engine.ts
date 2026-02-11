import { buildCallSystemPrompt, generateOpeningGreeting } from "./openai";
import { createVapiCall } from "./vapi";
import { prisma } from "./db";
import { culturalProfiles } from "./cultural-layer";

/**
 * Map country/language to the best Twilio <Say> voice.
 * Kept for backward compatibility with tests and any remaining Twilio references.
 */
export function getTwilioVoice(country: string): { voice: string; language: string } {
  const map: Record<string, { voice: string; language: string }> = {
    japan:     { voice: "Polly.Kazuha-Neural", language: "ja-JP" },
    korea:     { voice: "Polly.Seoyeon-Neural", language: "ko-KR" },
    china:     { voice: "Polly.Zhiyu-Neural",   language: "cmn-CN" },
    france:    { voice: "Polly.Lea-Neural",      language: "fr-FR" },
    italy:     { voice: "Polly.Bianca-Neural",   language: "it-IT" },
    spain:     { voice: "Polly.Lucia-Neural",    language: "es-ES" },
    germany:   { voice: "Polly.Vicki-Neural",    language: "de-DE" },
    thailand:  { voice: "Google.th-TH-Neural2-C", language: "th-TH" },
    australia: { voice: "Polly.Olivia-Neural",   language: "en-AU" },
    uk:        { voice: "Polly.Amy-Neural",      language: "en-GB" },
    usa:       { voice: "Polly.Joanna-Neural",   language: "en-US" },
  };

  const key = country.toLowerCase();
  return map[key] || { voice: "Polly.Joanna-Neural", language: "en-US" };
}

/**
 * Map country to the speech recognition language code.
 * Kept for backward compatibility with tests.
 */
export function getSpeechRecognitionLanguage(country: string): string {
  const map: Record<string, string> = {
    japan:     "ja-JP",
    korea:     "ko-KR",
    china:     "zh-CN",
    france:    "fr-FR",
    italy:     "it-IT",
    spain:     "es-ES",
    germany:   "de-DE",
    thailand:  "th-TH",
    australia: "en-AU",
    uk:        "en-GB",
    usa:       "en-US",
  };
  return map[country.toLowerCase()] || "en-US";
}

/**
 * Initiate a real phone call via Vapi.
 *
 * Flow:
 * 1. We build the system prompt and opening greeting using our existing OpenAI logic.
 * 2. We send a single API call to Vapi with a transient assistant config.
 * 3. Vapi handles the entire real-time conversation (STT → LLM → TTS) with
 *    sub-500ms latency, natural interruption handling, and ElevenLabs voices.
 * 4. When the call ends, Vapi sends a webhook to /api/vapi/webhook with the
 *    full transcript, recording URL, AI-generated summary, and structured data.
 */
export async function initiateCall(callRequestId: string): Promise<{
  success: boolean;
  vapiCallId?: string;
  error?: string;
}> {
  try {
    const callRequest = await prisma.callRequest.findUnique({
      where: { id: callRequestId },
    });

    if (!callRequest) {
      return { success: false, error: "Call request not found" };
    }

    // Check calling hours
    const countryKeyForHours = Object.keys(culturalProfiles).find(
      (k) => culturalProfiles[k].country.toLowerCase() === callRequest.country.toLowerCase()
    ) || callRequest.country.toLowerCase();
    const profile = culturalProfiles[countryKeyForHours];
    if (profile?.callingHours) {
      const tzOffsets: Record<string, number> = {
        japan: 9, korea: 9, china: 8, france: 1, italy: 1, spain: 1,
        germany: 1, thailand: 7, australia: 10, uk: 0, usa: -5,
      };
      const offset = tzOffsets[countryKeyForHours] ?? 0;
      const utcHour = new Date().getUTCHours();
      const localHour = (utcHour + offset + 24) % 24;

      if (localHour < profile.callingHours.start || localHour >= profile.callingHours.end) {
        return {
          success: false,
          error: `It's currently ${localHour}:00 local time in ${profile.country}. Business hours are ${profile.callingHours.start}:00–${profile.callingHours.end}:00. Try again during business hours for the best chance of reaching someone.`,
        };
      }
    }

    // Resolve country key for voice/prompt
    const countryKey = Object.keys(culturalProfiles).find(
      (k) => culturalProfiles[k].country.toLowerCase() === callRequest.country.toLowerCase()
    ) || callRequest.country.toLowerCase();

    // Generate opening greeting via OpenAI
    const greeting = await generateOpeningGreeting({
      country: countryKey,
      language: callRequest.language,
      objective: callRequest.objective,
      businessName: callRequest.businessName,
      tonePreference: callRequest.tonePreference,
    });

    // Build the system prompt
    const systemPrompt = buildCallSystemPrompt({
      country: countryKey,
      language: callRequest.language,
      objective: callRequest.objective,
      detailedNotes: callRequest.detailedNotes,
      tonePreference: callRequest.tonePreference,
      constraints: callRequest.constraints,
      fallbackOptions: callRequest.fallbackOptions,
      businessName: callRequest.businessName,
    });

    // Store greeting + prompt, mark as in_progress
    await prisma.callRequest.update({
      where: { id: callRequestId },
      data: {
        openingScript: greeting,
        callPlan: systemPrompt,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    // Create the call via Vapi
    const vapiCall = await createVapiCall({
      phoneNumber: callRequest.businessPhone,
      systemPrompt,
      firstMessage: greeting,
      country: countryKey,
      language: callRequest.language,
      callRequestId,
    });

    // Store the Vapi call ID
    await prisma.callRequest.update({
      where: { id: callRequestId },
      data: {
        twilioCallSid: vapiCall.id, // Reuse the field for Vapi call ID
        twilioStatus: vapiCall.status,
      },
    });

    return { success: true, vapiCallId: vapiCall.id };
  } catch (error: unknown) {
    console.error("Failed to initiate call:", error);

    // Mark call as failed
    await prisma.callRequest.update({
      where: { id: callRequestId },
      data: {
        status: "failed",
        outcome: "failed",
        summary: `Call failed to initiate: ${error instanceof Error ? error.message : "Unknown error"}`,
        completedAt: new Date(),
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
