// Defines all valid intervals for a payment plan.
// Using `as const` ensures TypeScript infers these as literal types.
export const PLAN_INTERVAL = ["hourly", "daily", "monthly", "biannually", "annually"] as const
