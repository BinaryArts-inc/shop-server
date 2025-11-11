import { Injectable } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Repository } from "typeorm"
import { Setting } from "../settings/entities/setting.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { GeneralSetting } from "../settings/entities/general.entity"
import { CreateGeneralSettingDto } from "../settings/dto/create-setting.dto"

@Injectable()
export class GeneralSeeder implements Seeder {
  constructor(
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
    @InjectRepository(GeneralSetting) private readonly generalRepository: Repository<GeneralSetting>
  ) {}

  async seed(): Promise<any> {
    const settings = await this.settingRepository.find()
    const setting = settings[0]

    const generalSetting: CreateGeneralSettingDto = {
      settingId: setting.id,
      contactEmail: "info@skishop.com",
      newsAndUpdateEmailNotification: false,
      payoutEmailNotification: true,
      productCreationEmailNotification: true,
      purchaseEmailNotification: true,
      alternativeContactEmail: null,
      setting
    }

    const generalSettingEntity = this.generalRepository.create(generalSetting)
    await this.generalRepository.save(generalSettingEntity)
  }

  async drop(): Promise<any> {
    await this.generalRepository.delete({})
  }
}
