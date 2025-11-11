import { Inject, Injectable } from "@nestjs/common"

import { PaymentModuleOption, PaymentStrategyType } from "./interfaces/config.interface"
import {
  CreateDVA,
  CreatePlan,
  CreateSubscription,
  CreateTransferRecipient,
  Currency,
  GetSubscription,
  GetSubscriptionResponse,
  InitiatePayment,
  InitiatePaymentResponse,
  IPaymentService,
  PaymentPlanResponse,
  SubscriptionResponse,
  Transfer
} from "./interfaces/strategy.interface"

import { CONFIG_OPTIONS } from "./constants/config"
import { PAYMENT_STRATEGY } from "./constants/strategies"
import { PaystackStrategy } from "./strategies/paystack.strategy"

/**
 * PaymentsService is the main entry point for all payment-related operations.
 * It delegates functionality to a specific payment strategy (e.g., Paystack).
 *
 * This service supports:
 * - Initiating and validating payments
 * - Creating payment plans and subscriptions
 * - Checking account balances
 * - Managing bank accounts and transfers
 * - Creating Dedicated Virtual Accounts (DVAs)
 */
@Injectable()
export class PaymentsService implements IPaymentService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    protected options: PaymentModuleOption,
    @Inject(PAYMENT_STRATEGY.paystack)
    private readonly paystack: PaystackStrategy
  ) {}

  /**
   * Mapping of provider names to their strategy implementations.
   * This allows for easy delegation based on the configured default provider.
   */
  private strategyMap: Record<PaymentStrategyType, IPaymentService> = {
    paystack: this.paystack
  }

  // -----------------------------
  // Public methods delegating to the selected strategy
  // -----------------------------

  /** Initiate a payment with the default provider */
  async initiatePayment(payload: InitiatePayment): Promise<InitiatePaymentResponse> {
    return this.with(this.options.default).initiatePayment(payload)
  }

  /** Validate a payment by reference */
  async validatePayment(reference: string): Promise<boolean> {
    return this.with(this.options.default).validatePayment(reference)
  }

  /** Create a payment plan */
  async createPaymentPlan(data: CreatePlan): Promise<PaymentPlanResponse> {
    return this.with(this.options.default).createPaymentPlan(data)
  }

  /** Create a subscription based on a plan */
  async createSubscription(data: CreateSubscription): Promise<SubscriptionResponse> {
    return await this.with(this.options.default).createSubscription(data)
  }

  /** Retrieve details of a subscription */
  async getSubscription(data: GetSubscription): Promise<GetSubscriptionResponse> {
    return await this.with(this.options.default).getSubscription(data)
  }

  /** Check the balance of the payment provider account */
  async checkBalance() {
    return await this.with(this.options.default).checkBalance()
  }

  /** Retrieve available banks for transfers */
  async getBanks(currency?: Currency) {
    return await this.with(this.options.default).getBanks(currency)
  }

  /** Create a transfer recipient */
  async createTransferRecipient(data: CreateTransferRecipient) {
    return await this.with(this.options.default).createTransferRecipient(data)
  }

  /** Execute a transfer to a recipient */
  async transfer(data: Transfer) {
    return await this.with(this.options.default).transfer(data)
  }

  /** Create a Direct Virtual Account (DVA) */
  async createDVA(data: CreateDVA): Promise<void> {
    return await this.with(this.options.default).createDVA(data)
  }

  // -----------------------------
  // Helper method
  // -----------------------------

  /**
   * Retrieve the strategy implementation for the given provider.
   * Uses the strategy map for delegation.
   * @param provider - the payment provider name (e.g., 'paystack')
   * @returns the strategy implementing IPaymentService
   */
  with(provider: PaymentStrategyType) {
    return this.strategyMap[provider]
  }
}
