import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Setting } from "../settings/entities/setting.entity"
import { Repository } from "typeorm"
import { PromotionSetting } from "../settings/entities/promotionSetting.entity"
import { CreatePromotionSettingDto } from "../settings/dto/create-setting.dto"

@Injectable()
export class PromotionSettingSeeder implements Seeder {
  constructor(
    @InjectRepository(Setting) private settingRepository: Repository<Setting>,
    @InjectRepository(PromotionSetting) private promotionSettingRepository: Repository<PromotionSetting>
  ) {}
  async seed(): Promise<any> {
    const settings = await this.settingRepository.find()
    const setting = settings[0]

    const promotionSetting: CreatePromotionSettingDto = {
      autoApprovePromotions: true,
      bannerPromotion: true,
      defaultDurationDays: 7,
      featuredSectionPromotion: true,
      maxPromotionsPerDay: 3,
      notifyOnNewRequest: true,
      notifyVendorOnApproval: true,
      settingId: setting.id,
      setting
    }

    const promotionSettingEntity = this.promotionSettingRepository.create(promotionSetting)
    await this.promotionSettingRepository.save(promotionSettingEntity)
  }
  async drop(): Promise<any> {
    await this.promotionSettingRepository.delete({})
  }
}
