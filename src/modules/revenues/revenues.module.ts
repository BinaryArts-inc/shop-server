import { Module } from "@nestjs/common"
import { OrdersModule } from "../orders/orders.module"
import { SubscriptionModule } from "../subscription/subscription.module"
import { AdsModule } from "../ads/ads.module"
import { RevenuesController } from "./revenues.controller"
import { RevenuesService } from "./revenues.service"
import { StoreModule } from "../stores/store.module"
import { CommisionsModule } from "../commisions/commisions.module"

@Module({
  imports: [OrdersModule, AdsModule, SubscriptionModule, StoreModule, CommisionsModule],
  controllers: [RevenuesController],
  providers: [RevenuesService]
})
export class RevenuesModule {}
