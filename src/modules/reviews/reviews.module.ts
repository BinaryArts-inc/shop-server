import { Module } from "@nestjs/common"
import { ReviewsService } from "./reviews.service"
import { ReviewsController } from "./reviews.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Review } from "./entities/review.entity"
import { ProductsModule } from "../products/products.module"
import { OrdersModule } from "../orders/orders.module"
import { StoreModule } from "../stores/store.module"

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ProductsModule, OrdersModule, StoreModule],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
