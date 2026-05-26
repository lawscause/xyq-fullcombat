export const PLANS = {
  monthly: {
    name: "Monthly",
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    price: 29,
    interval: "month" as const,
    description: "Full access to all training materials",
  },
  annual: {
    name: "Annual",
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    price: 290,
    interval: "year" as const,
    description: "Full access — save with annual billing",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
