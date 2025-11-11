// Supported payment methods
export const PAYMENT_METHODS = ["paystack"] as const

// Type representing a valid payment method
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
