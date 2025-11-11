import { Module } from "@nestjs/common"
import { CouponsService } from "./coupons.service"
import { CouponsController } from "./coupons.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Coupon } from "./entities/coupon.entity"
import { VoucherModule } from "../vouchers/voucher.module"

@Module({
  imports: [TypeOrmModule.forFeature([Coupon]), VoucherModule],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService]
})
export class CouponsModule {}
