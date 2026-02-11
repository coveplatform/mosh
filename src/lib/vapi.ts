/**
 * Vapi AI voice platform configuration.
 *
 * Vapi handles the entire real-time voice conversation:
 * STT → LLM → TTS with sub-500ms latency, interruption handling,
 * and natural-sounding multilingual voices.
 */

const VAPI_API_URL = "https://api.vapi.ai";

export function getVapiApiKey(): string {
  const key = process.env.VAPI_API_KEY;
  if (!key) throw new Error("VAPI_API_KEY is not set");
  return key;
}

export function getTwilioPhoneConfig(): {
  twilioAccountSid: string;
  twilioAuthToken: string;
  number: string;
} {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const number = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !number) {
    throw new Error("Twilio credentials not set — TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are required");
  }
  return { twilioAccountSid: sid, twilioAuthToken: token, number };
}

/**
 * Map country key to the best ElevenLabs multilingual voice for Vapi.
 *
 * Uses ElevenLabs Multilingual v2 voices which support all our target languages
 * with natural prosody. Each voice is selected for cultural appropriateness.
 *
 * Voice IDs are from ElevenLabs' public voice library.
 */
export function getVapiVoice(country: string): {
  provider: string;
  voiceId: string;
  language: string;
} {
  const key = country.toLowerCase();

  // ElevenLabs multilingual voices — these all support multiple languages natively
  const map: Record<string, { provider: string; voiceId: string; language: string }> = {
    japan:     { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "ja" },   // Rachel — warm, professional female
    korea:     { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "ko" },   // Rachel
    china:     { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "zh" },   // Rachel
    france:    { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "fr" },   // Rachel
    italy:     { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "it" },   // Rachel
    spain:     { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "es" },   // Rachel
    germany:   { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "de" },   // Rachel
    thailand:  { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "th" },   // Rachel
    australia: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "en" },   // Rachel
    uk:        { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "en" },   // Rachel
    usa:       { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "en" },   // Rachel
  };

  return map[key] || { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", language: "en" };
}

/**
 * Map country to Deepgram transcriber language code for Vapi.
 */
export function getTranscriberLanguage(country: string): string {
  const map: Record<string, string> = {
    japan:     "ja",
    korea:     "ko",
    china:     "zh",
    france:    "fr",
    italy:     "it",
    spain:     "es",
    germany:   "de",
    thailand:  "th",
    australia: "en",
    uk:        "en",
    usa:       "en",
  };
  return map[country.toLowerCase()] || "multi";
}

/**
 * Create an outbound phone call via Vapi.
 *
 * This sends a single API request — Vapi handles the entire real-time
 * conversation loop (STT + LLM + TTS) with sub-500ms latency.
 */
export async function createVapiCall(params: {
  phoneNumber: string;
  systemPrompt: string;
  firstMessage: string;
  country: string;
  language: string;
  callRequestId: string;
  maxDurationSeconds?: number;
}): Promise<{ id: string; status: string }> {
  const voice = getVapiVoice(params.country);
  const transcriberLang = getTranscriberLanguage(params.country);
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  const body = {
    // BYO Twilio phone number — Vapi routes the call through your Twilio account
    phoneNumber: getTwilioPhoneConfig(),

    // Customer to call
    customer: {
      number: params.phoneNumber,
    },

    // Transient assistant — configured per-call with our system prompt
    assistant: {
      // Transcriber (STT)
      transcriber: {
        provider: "deepgram",
        language: transcriberLang,
      },

      // LLM
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: params.systemPrompt,
          },
        ],
        temperature: 0.3,
        maxTokens: 300,
        emotionRecognitionEnabled: true,
      },

      // Voice (TTS)
      voice: {
        provider: voice.provider,
        voiceId: voice.voiceId,
      },

      // First message — the AI speaks first when the business picks up
      firstMessage: params.firstMessage,
      firstMessageMode: "assistant-speaks-first",

      // Voicemail detection — end call if voicemail detected
      voicemailDetection: "off",

      // Call settings
      maxDurationSeconds: params.maxDurationSeconds || 300, // 5 min max
      backgroundSound: "off",
      silenceTimeoutSeconds: 30,

      // End call phrases — the AI can end the call naturally
      endCallPhrases: [
        "goodbye",
        "さようなら",
        "감사합니다",
        "再见",
        "au revoir",
        "arrivederci",
        "adiós",
        "auf wiedersehen",
        "ลาก่อน",
      ],

      // Analysis — Vapi auto-generates summary + structured data
      analysisPlan: {
        summaryPlan: {
          enabled: true,
          messages: [
            {
              role: "system",
              content: `Summarize this phone call. The call was made by an AI assistant (Mosh) on behalf of a client. Include:
1. OUTCOME: success / partial / failed / callback_needed
2. What was requested
3. What was agreed/confirmed
4. Any action items for the client
5. Key details (dates, times, names, reference numbers)
Keep it concise — 3-5 sentences max.`,
            },
          ],
        },
        structuredDataPlan: {
          enabled: true,
          schema: {
            type: "object",
            properties: {
              outcome: {
                type: "string",
                enum: ["success", "partial", "failed", "callback_needed"],
                description: "The overall outcome of the call",
              },
              actionItems: {
                type: "string",
                description: "Comma-separated list of action items for the client",
              },
              confirmed: {
                type: "string",
                description: "What was confirmed/booked (date, time, name, etc.)",
              },
            },
          },
        },
        successEvaluationPlan: {
          enabled: true,
          rubric: "NumericScale",
        },
      },

      // Artifact plan — enable recording + transcript
      artifactPlan: {
        recordingEnabled: true,
        transcriptPlan: {
          enabled: true,
          assistantName: "Mosh",
          userName: "Business",
        },
      },

      // Server webhook — Vapi sends events here
      server: {
        url: `${baseUrl}/api/vapi/webhook`,
      },

      // Metadata — passed through to webhooks
      metadata: {
        callRequestId: params.callRequestId,
      },
    },

    // Call-level metadata (max 40 chars)
    name: `mosh-${params.callRequestId}`.slice(0, 40),
  };

  const response = await fetch(`${VAPI_API_URL}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getVapiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Vapi API error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return { id: data.id, status: data.status };
}
