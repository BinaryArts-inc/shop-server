export const PAYMENT_METHODS = ["paystack"] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
