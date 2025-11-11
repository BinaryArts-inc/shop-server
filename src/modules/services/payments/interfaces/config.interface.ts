import { ModuleMetadata } from "@nestjs/common"

// Defines the types of payment strategies the module supports
export type PaymentStrategyType = "paystack"

// Configuration options specific to Paystack
export interface PaystackOptions {
  secret: string // Secret key for authentication
  subscriptionCode: string // Code for subscription plans
}

// Placeholder for future providers
// export interface FlutterwaveOptions {}
// export interface StripeOptions {}

// Generic provider configuration object. Each key can correspond to a provider.
export type ProviderConfig = {
  paystack?: PaystackOptions
}

// Options used when registering the payment module synchronously
export interface PaymentModuleOption {
  providers: ProviderConfig // The configured payment providers
  default: keyof ProviderConfig // The default provider to use
}

// Options for asynchronous module registration
export interface PaymentModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<PaymentModuleOption> | PaymentModuleOption
  inject?: any[] // Dependencies to inject into the factory
}
