import { Module } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Order } from "./entities/order.entity"
import { OrderItem } from "./entities/order-item.entity"
import { OrderItemService } from "./orderItem.service"

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderItemService],
  exports: [OrdersService, OrderItemService]
})
export class OrdersModule {}
