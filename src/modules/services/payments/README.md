# Payments Module

The **Payments Module** is a NestJS module that provides an abstraction over multiple payment providers. Currently, it supports **Paystack**, but it is designed to be easily extendable with other providers. It exposes a single service (`PaymentsService`) for interacting with all payment methods and operations.

## Features

* Initiate payments (web and mobile)
* Validate payments
* Create payment plans
* Create and manage subscriptions
* Check balance
* Get banks for transfers
* Create transfer recipients
* Initiate transfers
* Create Dedicated Virtual Accounts (DVA)
* Fully asynchronous registration for dynamic configuration
* Strategy pattern for multiple providers

---

## Installation

```bash
npm install @nestjs/axios axios
```

Then import the module into your NestJS project.

---

## Configuration

### Synchronous Registration

```ts
import { Module } from '@nestjs/common'
import { PaymentsModule } from './services/payments/payments.module'

@Module({
  imports: [
    PaymentsModule.register({
      default: 'paystack', // default provider key
      providers: {
        paystack: {
          secret: process.env.PAYSTACK_SECRET,
          subscriptionCode: 'SUBSCRIPTION_CODE'
        }
      }
    })
  ]
})
export class AppModule {}
```

### Asynchronous Registration

Use this if your configuration is dynamic, e.g., fetched from a database or secret manager.

```ts
PaymentsModule.registerAsync({
  imports: [],
  useFactory: async () => ({
    default: 'paystack',
    providers: {
      paystack: {
        secret: await fetchSecretFromVault(),
        subscriptionCode: 'SUBSCRIPTION_CODE'
      }
    }
  })
})
```

---

## Usage

Inject the `PaymentsService` wherever you need it:

```ts
import { Injectable } from '@nestjs/common'
import { PaymentsService } from './services/payments/payments.service'

@Injectable()
export class PaymentExampleService {
  constructor(private readonly payments: PaymentsService) {}

  async payCustomer() {
    const payment = await this.payments.initiatePayment({
      email: 'customer@example.com',
      amount: 5000 // NGN 50.00
    })

    console.log(payment.checkoutUrl) // URL for web checkout
  }
}
```

---

## API

### `PaymentsService` Methods

| Method                    | Description                        | Params                    | Returns                          |
| ------------------------- | ---------------------------------- | ------------------------- | -------------------------------- |
| `initiatePayment`         | Start a payment transaction        | `InitiatePayment`         | `InitiatePaymentResponse`        |
| `validatePayment`         | Verify a payment by reference      | `string`                  | `boolean`                        |
| `createPaymentPlan`       | Create a recurring payment plan    | `CreatePlan`              | `PaymentPlanResponse`            |
| `createSubscription`      | Subscribe a user to a plan         | `CreateSubscription`      | `SubscriptionResponse`           |
| `getSubscription`         | Get subscription details           | `GetSubscription`         | `GetSubscriptionResponse`        |
| `checkBalance`            | Get provider account balances      | -                         | `CheckBalance`                   |
| `getBanks`                | List banks available for transfer  | `Currency?`               | `Bank[]`                         |
| `createTransferRecipient` | Create a transfer recipient        | `CreateTransferRecipient` | `{ code: string, name: string }` |
| `transfer`                | Initiate a transfer to a recipient | `Transfer`                | `void`                           |
| `createDVA`               | Create a Dedicated Virtual Account | `CreateDVA`               | `void`                           |

---

## Strategy Pattern

* Each provider (Paystack, Stripe, Flutterwave, etc.) implements the `IPaymentService` interface.
* The `PaymentsService` delegates all operations to the selected provider using a strategy map.
* Default provider is defined in module config (`default`).

```ts
const result = this.payments.with('paystack').createPaymentPlan(planData)
```

* You can add multiple providers and call them explicitly without changing the default.

---

## Error Handling

* All methods throw exceptions if the provider API call fails.
* Errors are mapped from the HTTP response of the payment provider.
* Example:

```ts
try {
  await payments.validatePayment('INVALID_REFERENCE')
} catch (err) {
  console.error(err.message)
}
```

---

## Extending with New Providers

1. Implement the `IPaymentService` interface.
2. Register the provider in `PaymentsModule`.
3. Add it to the `strategyMap` in `PaymentsService`.
4. Optionally, inject it in other services.

---

## Example Flow

```ts
// Create a payment plan
const plan = await payments.createPaymentPlan({
  name: 'Pro Plan',
  interval: 'monthly',
  amount: 10000
})

// Subscribe user
const subscription = await payments.createSubscription({
  email: 'user@example.com',
  planCode: plan.planCode,
  amount: 10000
})

// Validate payment
const isPaid = await payments.validatePayment(subscription.reference)
```

---

## Notes

* All amounts should be in the **smallest currency unit** (e.g., kobo for NGN).
* Callback URLs, metadata, and currency are optional depending on provider requirements.
* The module is designed for **NestJS**, but strategies are plain classes that can be reused elsewhere.
