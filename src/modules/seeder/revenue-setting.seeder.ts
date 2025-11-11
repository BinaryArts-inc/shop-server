import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { RevenueSetting } from "../settings/entities/revenueSetting.entity"
import { Repository } from "typeorm"
import { Setting } from "../settings/entities/setting.entity"
import { CreateRevenueSettingDto } from "../settings/dto/create-setting.dto"

@Injectable()
export class RevenueSettingSeeder implements Seeder {
  constructor(
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
    @InjectRepository(RevenueSetting) private readonly revenueSettingRepository: Repository<RevenueSetting>
  ) {}

  async seed(): Promise<any> {
    const settings = await this.settingRepository.find()
    const setting = settings[0]

    const revenueSetting: CreateRevenueSettingDto = {
      autoExpiryNotification: true,
      fulfillmentFeePercentage: 10,
      gasFee: 1000,
      gracePeriodAfterExpiry: 7,
      maxPayoutAmount: 100000,
      maxWithdrawalsPerDay: 1,
      minPayoutAmount: 10000,
      monthlySubscriptionFee: 10000,
      notifyOnCommissionDeduction: true,
      notifyOnSubscriptionExpiry: true,
      notifyUserOnApproval: true,
      yearlySubscriptionFee: 100000,
      settingId: setting.id,
      setting
    }

    const revenueSettingEntity = this.revenueSettingRepository.create(revenueSetting)
    await this.revenueSettingRepository.save(revenueSettingEntity)
  }

  async drop(): Promise<any> {
    await this.revenueSettingRepository.delete({})
  }
}
