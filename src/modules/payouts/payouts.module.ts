import { Module } from "@nestjs/common"
import { PayoutsService } from "./payouts.service"
import { PayoutsController } from "./payouts.controller"
import { Payout } from "./entities/payout.entity"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [TypeOrmModule.forFeature([Payout])],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService]
})
export class PayoutsModule {}
