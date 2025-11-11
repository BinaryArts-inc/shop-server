import { Module } from "@nestjs/common"
import { WithdrawalsService } from "./withdrawals.service"
import { WithdrawalsController } from "./withdrawals.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Withdrawal } from "./entities/withdrawal.entity"
import { BankModule } from "../banks/bank.module"
import { PayoutsModule } from "../payouts/payouts.module"
import { SettingsModule } from "../settings/settings.module"

@Module({
  imports: [TypeOrmModule.forFeature([Withdrawal]), BankModule, PayoutsModule, SettingsModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService]
})
export class WithdrawalsModule {}
