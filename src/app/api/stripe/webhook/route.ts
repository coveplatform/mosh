import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanByPriceId, PLAN_CONFIG } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription lifecycle:
 * - checkout.session.completed → activate subscription
 * - customer.subscription.updated → handle plan changes
 * - customer.subscription.deleted → downgrade to free
 * - invoice.payment_succeeded → refresh credits monthly
 * - invoice.payment_failed → notify user
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

/**
 * Checkout completed — activate the subscription and upgrade the user.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("Checkout session missing userId metadata");
    return;
  }

  const planId = session.metadata?.planId;
  if (!planId || !(planId in PLAN_CONFIG)) {
    console.error("Checkout session missing or invalid planId metadata");
    return;
  }

  const plan = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
  const subscriptionId = session.subscription as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: planId,
      credits: plan.credits,
      creditsMax: plan.credits,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: plan.stripePriceId,
      stripeCustomerId: session.customer as string,
    },
  });

  // Record the credit grant
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: plan.credits,
      type: "subscription",
      description: `Upgraded to ${plan.name} plan — ${plan.credits} credits`,
    },
  });

  console.info(`[Stripe] User ${userId} upgraded to ${plan.name} plan`);
}

/**
 * Subscription updated — handle plan changes (upgrade/downgrade).
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) return;

  const planId = getPlanByPriceId(priceId);
  if (!planId) return;

  const plan = PLAN_CONFIG[planId];

  // Only update if the subscription is active
  if (subscription.status === "active") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId,
        creditsMax: plan.credits,
        stripePriceId: priceId,
        planExpiresAt: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
      },
    });

    console.info(`[Stripe] User ${userId} subscription updated to ${plan.name}`);
  }
}

/**
 * Subscription deleted — downgrade to free plan.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const freeConfig = PLAN_CONFIG.free;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "free",
      creditsMax: freeConfig.credits,
      stripeSubscriptionId: null,
      stripePriceId: null,
      planExpiresAt: null,
    },
  });

  // Record the downgrade
  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: 0,
      type: "subscription",
      description: "Subscription cancelled — downgraded to Explorer (free) plan",
    },
  });

  console.info(`[Stripe] User ${userId} subscription cancelled — downgraded to free`);
}

/**
 * Invoice payment succeeded — refresh monthly credits.
 * This fires on each successful billing cycle (not the first one, which is handled by checkout).
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Skip the first invoice (handled by checkout.session.completed)
  if (invoice.billing_reason === "subscription_create") return;

  const customerId = invoice.customer as string;
  if (!customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const planConfig = PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG];
  if (!planConfig) return;

  // Refresh credits to the plan's monthly amount
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: planConfig.credits },
  });

  // Record the credit refresh
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: planConfig.credits,
      type: "subscription",
      description: `Monthly credit refresh — ${planConfig.credits} credits (${planConfig.name} plan)`,
    },
  });

  console.info(`[Stripe] User ${user.id} credits refreshed to ${planConfig.credits}`);
}

/**
 * Invoice payment failed — log it. The user keeps their current credits
 * but Stripe will retry and eventually cancel if it keeps failing.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  console.warn(`Payment failed for user ${user.id} (${user.email})`);

  // Record the failed payment
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 0,
      type: "subscription",
      description: "Payment failed — Stripe will retry. Your plan remains active for now.",
    },
  });
}
