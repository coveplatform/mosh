import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/user/me
 *
 * Returns the current user's profile data including plan and credits.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      replyToEmail: user.replyToEmail || null,
      plan: user.plan,
      credits: user.credits,
      creditsMax: user.creditsMax,
      stripeCustomerId: user.stripeCustomerId || null,
      stripeSubscriptionId: user.stripeSubscriptionId || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
