import twilio from "twilio";
import { NextRequest } from "next/server";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

let _client: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!_client) {
    _client = twilio(accountSid, authToken);
  }
  return _client;
}

export function getTwilioPhoneNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER!;
}

export function getBaseUrl(): string {
  return process.env.BASE_URL || "http://localhost:3000";
}

/**
 * Validate that an incoming webhook request actually came from Twilio.
 * Uses the X-Twilio-Signature header and the auth token to verify.
 *
 * In development (no BASE_URL set), validation is skipped.
 */
export async function validateTwilioWebhook(
  req: NextRequest,
  formData: FormData
): Promise<boolean> {
  // Skip validation in development
  if (!process.env.BASE_URL || process.env.NODE_ENV === "development") {
    return true;
  }

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) {
    console.warn("Twilio webhook: missing X-Twilio-Signature header");
    return false;
  }

  // Reconstruct the full URL Twilio used to call us
  const url = `${process.env.BASE_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;

  // Convert FormData to a plain object for validation
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (err) {
    console.error("Twilio signature validation error:", err);
    return false;
  }
}
