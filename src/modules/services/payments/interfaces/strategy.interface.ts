import { PlanInterval } from "./plan-interval.interface"

// Core interface all payment strategies must implement
export interface IPaymentService {
  initiatePayment: (data: InitiatePayment) => Promise<InitiatePaymentResponse>
  validatePayment: (refrence: string) => Promise<boolean>
  createPaymentPlan: (data: CreatePlan) => Promise<PaymentPlanResponse>
  createSubscription: (data: CreateSubscription) => Promise<SubscriptionResponse>
  getSubscription: (data: GetSubscription) => Promise<GetSubscriptionResponse>
  checkBalance: () => Promise<CheckBalance>
  getBanks: (currency?: Currency) => Promise<Bank[]>
  createTransferRecipient: (data: CreateTransferRecipient) => Promise<CreateTransferRecipientResponse>
  transfer(data: Transfer): Promise<void>
  createDVA(data: CreateDVA): Promise<void>
}

// Represents a Direct Virtual Account creation payload
export type CreateDVA = {
  email: string
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber: string
  preferredBank: "titan-paystack" | "test-bank" | "wema-bank"
  country?: "NG"
  accountNumber?: string
  bvn?: string
  bankCode?: string
}

// Represents a fund transfer payload
export type Transfer = {
  amount: number
  reference: string
  recipient: string
  reason: string
  currency?: Currency
}

// Represents creating a transfer recipient
export type CreateTransferRecipient = {
  type?: string
  name: string
  accountNumber: string
  bankCode: string
  currency?: Currency
  description?: string
  metadata?: Record<string, any>
}

// Response returned after creating a transfer recipient
export type CreateTransferRecipientResponse = {
  code: string
  name: string
}

// Bank representation
type Bank = {
  name: string
  code: string
}

export type GetBanks = Bank[]

// Supported currencies
export type Currency = "NGN" | "USD" | "GHS" | "ZAR" | "KES" | "XOF"

// Payload for initiating a payment
export interface InitiatePayment {
  amount: number
  email: string
  currency?: Currency
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
}

// Response from initiating a payment
export interface InitiatePaymentResponse {
  checkoutUrl: string // URL for web checkout
  reference: string
  checkoutCode: string // Mobile-friendly code
}

// Response when creating a subscription
export interface SubscriptionResponse extends Partial<InitiatePayment> {
  authorizationUrl: string
  accessCode: string
}

// Payment plan representation
export interface PaymentPlanResponse {
  amount: number
  interval: string
  planCode: string
  name: string
}

// Payload for creating a subscription
export interface CreateSubscription {
  email: string
  amount: number
  planCode: string
  reference?: string
}

// Payload for creating a plan
export interface CreatePlan {
  name: string
  interval: PlanInterval
  amount: number
}

// Response for fetching a subscription
export interface GetSubscriptionResponse {
  plan_code: string
  interval: string
  customer_code: string
  customer_email: string
}

// Payload for fetching a subscription
export interface GetSubscription {
  code: string
}

// Balance check type
export type CheckBalance = Array<{
  currency: Currency
  balance: number
}>
