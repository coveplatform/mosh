import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Plan definitions — maps our internal plan IDs to Stripe price IDs and credit amounts.
 * Set STRIPE_PRICE_MEMBER and STRIPE_PRICE_GLOBAL in your .env to the Stripe Price IDs
 * you create in the Stripe Dashboard.
 */
export const PLAN_CONFIG = {
  free: {
    name: "Explorer",
    credits: 3,
    creditsMax: 3,
    stripePriceId: null,
  },
  member: {
    name: "Member",
    credits: 15,
    creditsMax: 15,
    stripePriceId: process.env.STRIPE_PRICE_MEMBER || null,
  },
  global: {
    name: "Global",
    credits: 50,
    creditsMax: 50,
    stripePriceId: process.env.STRIPE_PRICE_GLOBAL || null,
  },
} as const;

export type PlanId = keyof typeof PLAN_CONFIG;

/**
 * Look up which plan a Stripe price ID belongs to.
 */
export function getPlanByPriceId(priceId: string): PlanId | null {
  for (const [planId, config] of Object.entries(PLAN_CONFIG)) {
    if (config.stripePriceId === priceId) {
      return planId as PlanId;
    }
  }
  return null;
}
