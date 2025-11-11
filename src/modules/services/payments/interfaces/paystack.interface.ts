import { Currency, GetBanks } from "./strategy.interface"

export type PaystackEventType =
  | "charge.success"
  | "invoice.create"
  | "transfer.success"
  | "transfer.failed"
  | "transfer.reversed"
  | "customeridentification.failed"
  | "customeridentification.success"
  | "dedicatedaccount.assign.failed"
  | "dedicatedaccount.assign.success"

// type PaystackWebhookBody<T> = PaystackChargeSuccess<T> | PaystackTransferData

export type PaystackWebhook = {
  event: PaystackEventType
  data: any
}

export type PaystackChargeSuccess<T = any> = {
  id: number
  domain: string
  status: string
  reference: string
  amount: number
  message: string | null
  gateway_response: string
  paid_at: string
  created_at: string
  channel: string
  period_start: Date
  period_end: Date
  currency: string
  ip_address: string
  metadata: any
  fees_breakdown: any | null
  log: any | null
  fees: number
  fees_split: any | null
  authorization: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
    signature: string
    account_name: string | null
    sender_bank: string
    sender_bank_account_number: string
    sender_country: string
    sender_name: string
    narration: string
    receiver_bank_account_number: string
    receiver_bank: string
  }
  customer: {
    id: number
    first_name: string | null
    last_name: string | null
    email: string
    customer_code: string
    phone: string | null
    metadata: T
    risk_action: string
    international_format_phone: string | null
  }
  plan: Record<string, unknown>
  subaccount: Record<string, unknown>
  split: Record<string, unknown>
  order_id: string | null
  paidAt: string
  requested_amount: number
  pos_transaction_data: any | null
  source: {
    type: string
    source: string
    entry_point: string
    identifier: string | null
  }
  transaction: {
    reference: string | null
    status: string | null
    amount: number | null
    currency: string
  }
  subscription: {
    status: string
    subscription_code: string
    email_token: string
    amount: number
    cron_expression: string
    next_payment_date: Date
    open_invoice: null
  }
}

// export interface PaystackSubscriptionCreated {}

export interface PaystackApiResponse<T> {
  status: boolean
  message: string
  data: T
}

export type PaystackInitiatePaymentResponse = PaystackApiResponse<{
  authorization_url: string
  access_code: string
  reference: string
}>

export type PaystackBalanceResponse = PaystackApiResponse<
  Array<{
    currency: Currency
    balance: number
  }>
>

export type PaystackGetBanksResponse = PaystackApiResponse<GetBanks>

export type PaystackPaymentStatus = "abandoned" | "failed" | "ongoing" | "pending" | "processing" | "queued" | "reversed" | "success"

export type PaystackTransactionVerification = PaystackApiResponse<{
  id: number
  domain: string
  status: PaystackPaymentStatus
  reference: string
  receipt_number: string | null
  amount: number
  message: string | null
  gateway_response: string
  paid_at: string
  created_at: string
  channel: string
  currency: string
  ip_address: string
  metadata: any // Could be string or object depending on usage
  log: {
    start_time: number
    time_spent: number
    attempts: number
    errors: number
    success: boolean
    mobile: boolean
    input: any[]
    history: {
      type: string
      message: string
      time: number
    }[]
  } | null
  fees: number
  fees_split: any | null
  authorization: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
    signature: string
    account_name: string | null
  }
  customer: {
    id: number
    first_name: string | null
    last_name: string | null
    email: string
    customer_code: string
    phone: string | null
    metadata: any
    risk_action: string
    international_format_phone: string | null
  }
  plan: any | null
  split: any
  order_id: string | null
  paidAt: string
  createdAt: string
  requested_amount: number
  pos_transaction_data: any | null
  source: any | null
  fees_breakdown: any | null
  connect: any | null
  transaction_date: string
  plan_object: any
  subaccount: any
}>

export interface PaystackPlanResponse<T> {
  status: boolean
  message: string
  data: T
}

export interface PaystackPlanData {
  name: string
  interval: string
  amount: number
  integration: number
  domain: string
  currency: string
  plan_code: string
  invoice_limit: number
  send_invoices: boolean
  send_sms: boolean
  hosted_page: boolean
  migrate: boolean
  id: number
  createdAt: string
  updatedAt: string
}

export type PaystackCreateRcipientResponse = PaystackApiResponse<{
  active: boolean
  createdAt: string
  currency: Currency
  id: number
  integration: number
  name: string
  recipient_code: string
  type: TransferRecipientType
  updatedAt: string
  is_deleted: boolean
}>

export interface GetSubscriptionPaystackResponse {
  invoices: any[]
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
    metadata: {
      photos: {
        type: string
        typeId: string
        typeName: string
        url: string
        isPrimary: boolean
      }[]
    }
    domain: string
    customer_code: string
    id: number
    integration: number
    createdAt: string
    updatedAt: string
  }
  plan: {
    domain: string
    name: string
    plan_code: string
    description: string | null
    amount: number
    interval: string
    send_invoices: boolean
    send_sms: boolean
    hosted_page: boolean
    hosted_page_url: string | null
    hosted_page_summary: string | null
    currency: string
    id: number
    integration: number
    createdAt: string
    updatedAt: string
  }
  integration: number
  authorization: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
    signature: string
    account_name: string
  }
  domain: string
  start: number
  status: string
  quantity: number
  amount: number
  subscription_code: string
  email_token: string
  easy_cron_id: string | null
  cron_expression: string
  next_payment_date: string
  open_invoice: any | null
  id: number
  createdAt: string
  updatedAt: string
}

export type TransferRecipientType = "ghipss" | "mobile_money" | "kepss" | "nuban" | "basa" | "authorization"

export type CreatePaystackTransferRecipient = {
  type: TransferRecipientType
  name: string
  account_number: string
  bank_code: string
  currency: Currency
  description?: string
  metadata?: Record<string, any>
}

export type PaystackTransfer = {
  source: "balance"
  amount: number
  reference: string
  recipient: string
  reason: string
  currency: Currency
}

export interface PaystackTransferData {
  amount: number
  currency: Currency
  id: number
  reason: string
  reference: string
  source: "balance"
  status: string
  transfer_code: string
  transferred_at: null
  recipient: {
    active: boolean
    currency: Currency
    description: string
    email: string | null
    id: number
    integration: number
    metadata: Record<string, any> | null
    name: string
    recipient_code: string
    type: TransferRecipientType
    is_deleted: boolean
    details: {
      account_number: string
      account_name: string
      bank_code: string
      bank_name: string
    }
    created_at: string
    updated_at: string
  }
  created_at: string
  updated_at: string
}

// {
//   "event": "customeridentification.success",
//   "data": {
//     "customer_id": "9387490384",
//     "customer_code": "CUS_xnxdt6s1zg1f4nx",
//     "email": "bojack@horsinaround.com",
//     "identification": {
//       "country": "NG",
//       "type": "bank_account",
//       "bvn": "200*****677",
//       "account_number": "012****789",
//       "bank_code": "007"
//     }
//   }
// }

// {
//   "event": "customeridentification.failed",
//   "data": {
//     "customer_id": 82796315,
//     "customer_code": "CUS_XXXXXXXXXXXXXXX",
//     "email": "email@email.com",
//     "identification": {
//       "country": "NG",
//       "type": "bank_account",
//       "bvn": "123*****456",
//       "account_number": "012****345",
//       "bank_code": "999991"
//     },
//     "reason": "Account number or BVN is incorrect"
//   }
// }

export type CustomerIdentificationFailed = {
  customer_id: number
  customer_code: string
  email: string
  reason: string
  identification: {
    country: string
    type: "bank_account" | string
    bvn: string
    account_number: string
    bank_code: string
  }
}

export type CustomerIdentificationSuccess = {
  customer_id: string
  customer_code: string
  email: string
  identification: {
    country: "NG"
    type: string
    value: string
  }
}

export type DVAAssignFailed = {
  customer: {
    id: number
    first_name: string
    last_name: string
    email: string
    customer_code: string
    phone: string
    // metadata: {}
    risk_action: string
    international_format_phone: string
  }
  dedicated_account: null
  identification: {
    status: "failed"
  }
}

export type DVAAssignSuccess = {
  customer: {
    id: number
    first_name: string
    last_name: string
    email: string
    customer_code: string
    phone: string
    // metadata: {}
    risk_action: "default"
    international_format_phone: string
  }
  dedicated_account: {
    bank: {
      name: string
      id: number
      slug: string
    }
    account_name: string
    account_number: string
    assigned: boolean
    currency: "NGN"
    // metadata: null
    active: boolean
    id: number
    created_at: string
    updated_at: string
    assignment: {
      integration: number
      assignee_id: number
      assignee_type: string
      expired: boolean
      account_type: "PAY-WITH-TRANSFER-RECURRING"
      assigned_at: string
      expired_at: null
    }
  }
  identification: {
    status: "success"
  }
}
