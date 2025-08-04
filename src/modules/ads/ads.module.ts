import { Module } from "@nestjs/common"
import { AdsService } from "./ads.service"
import { AdsController } from "./ads.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Ad } from "./entities/ad.entity"
import { ProductsModule } from "../products/products.module"
import { PromotionsModule } from "../promotions/promotions.module"
import { AdExpirationProcessorService } from "./ad-expiration-processor.service"
import { BullModule } from "@nestjs/bullmq"
import { AppQueues } from "@/constants"

@Module({
  imports: [TypeOrmModule.forFeature([Ad]), ProductsModule, PromotionsModule, BullModule.registerQueue({ name: AppQueues.END_ADS })],
  controllers: [AdsController],
  providers: [AdsService, AdExpirationProcessorService],
  exports: [AdsService]
})
export class AdsModule {}
