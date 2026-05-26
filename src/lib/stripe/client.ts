import Stripe from "stripe";

/**
 * Lazily create Stripe client to avoid initialization at build time.
 */
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
