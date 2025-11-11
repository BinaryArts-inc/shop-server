// This file defines constants for the supported payment strategies.
// It allows the payment module to dynamically inject and select
// a specific strategy (like Paystack) without hardcoding the class names.

/**
 * Key: generic name to reference the strategy
 * Value: token used for dependency injection
 */
export const PAYMENT_STRATEGY = {
  paystack: "PAYSTACK_STRATEGY"
}
