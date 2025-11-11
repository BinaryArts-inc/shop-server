import { Injectable } from "@nestjs/common"
import { OrdersService } from "../orders/orders.service"
import { PaymentsService } from "../services/payments/payments.service"
import { PaystackChargeSuccess, PaystackTransferData } from "../services/payments/interfaces/paystack.interface"
import { CartsService } from "../carts/carts.service"
import { SubscriptionService } from "../subscription/subscription.service"
import { Subscription, SubscriptionEnum } from "../subscription/entities/subscription.entity"
import { UserService } from "../users/user.service"
import { Order } from "../orders/entities/order.entity"
import { StoreService } from "../stores/store.service"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"
import { WithdrawalsService } from "../withdrawals/withdrawals.service"
import { PayoutsService } from "../payouts/payouts.service"
import { AdsService } from "../ads/ads.service"
import { Ad } from "../ads/entities/ad.entity"
import { vendonEnumType } from "../stores/entities/store.entity"
import { CommisionsService } from "../commisions/commisions.service"
import { VoucherService } from "../vouchers/voucher.service"
import { VoucherEnum } from "../vouchers/enum/voucher-enum"
import { SettingsService } from "../settings/settings.service"

@Injectable()
export class WebhookService {
  constructor(
    private orderService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly cartsService: CartsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
    private readonly adsService: AdsService,
    private readonly transactionHelper: TransactionHelper,
    private readonly withdrawalsService: WithdrawalsService,
    private readonly payoutsService: PayoutsService,
    private readonly commisionService: CommisionsService,
    private readonly voucherService: VoucherService,
    private readonly settingsService: SettingsService
  ) {}

  async handleChargeSuccess(data: PaystackChargeSuccess) {
    const isValid = await this.paymentsService.with("paystack").validatePayment(data.reference)
    if (!isValid) return

    const [subscription, ads, order] = await Promise.all([
      this.subscriptionService.findOne({ reference: data.reference }),
      this.adsService.findOne({ reference: data.reference }),
      this.orderService.findOne({ reference: data.reference })
    ])

    if (!subscription && !ads && !order) return

    if (subscription) {
      await this.handleChargeSuccessForSubscription(subscription)
    }

    if (ads) {
      await this.handleChargeForAds(ads)
    }

    if (order) {
      await this.handleChargeSuccessForOrders(order, data)
    }
  }

  async handleChargeSuccessForSubscription(subscription: Subscription) {
    if (!subscription || subscription.status === SubscriptionEnum.ACTIVE) {
      return
    }

    const vendor = await this.userService.findOne({ id: subscription.vendorId })

    if (!vendor) return

    const { startDate, endDate } = await this.subscriptionService.getStartAndEndDate(subscription.planType.toLowerCase())

    const updatedSubscription = await this.subscriptionService.update(subscription, {
      status: SubscriptionEnum.ACTIVE,
      isPaid: true,
      startDate,
      endDate
    })

    // dispatch job to end subscription
    await this.subscriptionService.dispatch({ name: subscription.id, data: updatedSubscription })

    const store = await this.storeService.findOne({ id: vendor.business.store.id })

    if (!store) {
      return
    }

    await this.storeService.update(store, { isStarSeller: true, type: vendonEnumType.PREMIUM })

    return
  }

  async handleChargeSuccessForOrders(order: Order, data: PaystackChargeSuccess) {
    if (!order || order.status === "paid") {
      return
    }

    await this.transactionHelper.runInTransaction(async (manager) => {
      await this.cartsService.remove({ user: { id: order.buyerId } }, manager)
      const user = await this.userService.findOne({ id: order.buyerId })

      await this.orderService.update(
        order,
        {
          status: "paid",
          deliveryStatus: "pending",
          paidAt: data.paidAt
        },
        manager
      )

      const voucher = await this.voucherService.findOne({ orderId: order.id })
      if (voucher) {
        await this.voucherService.update(voucher, { status: VoucherEnum.REDEEMED }, manager)
      }

      for (const item of order.items) {
        const product = item.product
        const storeId = product.user.business.store.id
        const total = item.unitPrice * item.quantity
        const commission = await this.commisionService.calculateOrderItemCommission(item)
        const vendor = await this.userService.findOne({ id: item.product.user.id })

        const totalAfterCommission = total - commission
        const payout = await this.payoutsService.findOne({ storeId })

        const store = await this.storeService.findById(storeId)
        await this.storeService.update(store, { numberOfSales: store.numberOfSales + item.quantity }, manager)

        if (!payout) {
          await this.payoutsService.create({ storeId, total: totalAfterCommission, available: totalAfterCommission }, manager)
        } else {
          await this.payoutsService.update(payout, payout.handleVendorOrder(totalAfterCommission), manager)
        }

        const setting = await this.settingsService.findOneSetting()

        await this.commisionService.create(
          {
            amount: commission,
            value: setting.revenueSetting.fulfillmentFeePercentage,
            storeId,
            orderItemId: item.id
          },
          manager
        )
        await this.userService.update(vendor, { itemsCount: vendor.itemsCount + 1 }, manager)
      }

      await this.userService.update(user, { ordersCount: user.ordersCount + 1 }, manager)
    })
  }

  async handleInvoiceCreate(data: PaystackChargeSuccess) {
    const user = await this.userService.findOne({ email: data.customer.email })

    if (!user) return

    const subscription = await this.subscriptionService.getSubscription({ code: data.subscription.subscription_code })

    if (!subscription) return

    await this.subscriptionService.create({
      amount: data.transaction.amount,
      planCode: subscription.plan_code,
      planType: subscription.interval,
      status: SubscriptionEnum.INACTIVE,
      reference: data.transaction.reference,
      vendorId: user.id,
      startDate: data.period_start,
      endDate: data.period_end,
      subscriptionCode: data.subscription.subscription_code,
      isPaid: false
    })
  }

  async handleTransferSuccess(data: PaystackTransferData) {
    const withdrawal = await this.withdrawalsService.findById(data.reference)
    if (!withdrawal) return

    // why are we here exactly?
    if (withdrawal.status !== "pending") return

    return this.transactionHelper.runInTransaction(async (manager) => {
      const successDto = withdrawal.payout.handleWithdrawSuccess(withdrawal.amount)
      await this.payoutsService.update(withdrawal.payout, successDto, manager)
      await this.withdrawalsService.update(withdrawal, { status: "success" }, manager)
    })
  }

  async handleTransferFailed(data: PaystackTransferData) {
    const withdrawal = await this.withdrawalsService.findById(data.reference)
    if (!withdrawal) return

    // why are we here exactly?
    if (withdrawal.status !== "pending") return

    return this.transactionHelper.runInTransaction(async (manager) => {
      await this.payoutsService.update(withdrawal.payout, withdrawal.payout.handleWithdrawFailed(withdrawal.amount), manager)
      await this.withdrawalsService.update(withdrawal, { status: "failed" }, manager)
    })
  }

  async handleChargeForAds(data: Ad) {
    const { startDate, endDate } = await this.adsService.calculateStartAndEndDate(data.duration)
    const updated = await this.adsService.update(data, { status: "active", startDate, endDate })
    await this.adsService.dispatch({ name: data.id, data: updated })
    return
  }
}
