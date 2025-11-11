import { Module } from "@nestjs/common"
import { WebhookService } from "./webhook.service"
import { OrdersModule } from "../orders/orders.module"
import { WebhookController } from "./webhook.controller"
import { PaymentsService } from "../services/payments/payments.service"
import { CartsModule } from "../carts/carts.module"
import { PlansModule } from "../plans/plans.module"
import { UserModule } from "../users/user.module"
import { SubscriptionModule } from "../subscription/subscription.module"
import { StoreModule } from "../stores/store.module"
import { WithdrawalsModule } from "../withdrawals/withdrawals.module"
import { PayoutsModule } from "../payouts/payouts.module"
import { AdsModule } from "../ads/ads.module"
import { SettingsModule } from "../settings/settings.module"
import { CommisionsModule } from "../commisions/commisions.module"
import { VoucherModule } from "../vouchers/voucher.module"

@Module({
  imports: [
    OrdersModule,
    CartsModule,
    SubscriptionModule,
    PlansModule,
    UserModule,
    StoreModule,
    WithdrawalsModule,
    PayoutsModule,
    AdsModule,
    SettingsModule,
    CommisionsModule,
    VoucherModule
  ],
  controllers: [WebhookController],
  providers: [WebhookService, PaymentsService]
})
export class WebhooksModule {}
