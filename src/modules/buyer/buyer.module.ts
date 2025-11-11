import { Module } from "@nestjs/common"
import { BuyerController } from "./buyer.controller"
import { UserModule } from "../users/user.module"
import { OrdersModule } from "../orders/orders.module"
import { BuyerService } from "./buyer.service"

@Module({
  imports: [UserModule, OrdersModule],
  controllers: [BuyerController],
  providers: [BuyerService]
})
export class BuyerModule {}
