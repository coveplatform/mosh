import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getStripe, PLAN_CONFIG, type PlanId } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for upgrading to a paid plan.
 * Returns the checkout URL for the client to redirect to.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId || !["member", "global"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'member' or 'global'." },
        { status: 400 }
      );
    }

    const plan = PLAN_CONFIG[planId as PlanId];
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for ${plan.name} plan. Set STRIPE_PRICE_${planId.toUpperCase()} in your .env` },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // If user already has an active subscription, redirect to portal instead
    if (user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "You already have an active subscription. Use the customer portal to manage it." },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/plans?success=true&plan=${planId}`,
      cancel_url: `${baseUrl}/dashboard/plans?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
