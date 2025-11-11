import { Module } from "@nestjs/common"
import { UserModule } from "../users/user.module"
import { StoreModule } from "../stores/store.module"
import { VendorController } from "./vendor.controller"
import { BusinessModule } from "../business/business.module"
import { SubscriptionModule } from "../subscription/subscription.module"
import { ProductsModule } from "../products/products.module"
import { OrdersModule } from "../orders/orders.module"
import { PayoutsModule } from "../payouts/payouts.module"
import { WithdrawalsModule } from "../withdrawals/withdrawals.module"
import { VendorService } from "./vendor.service"

@Module({
  imports: [UserModule, StoreModule, BusinessModule, SubscriptionModule, ProductsModule, OrdersModule, PayoutsModule, WithdrawalsModule],
  controllers: [VendorController],
  providers: [VendorService]
})
export class VendorModule {}
