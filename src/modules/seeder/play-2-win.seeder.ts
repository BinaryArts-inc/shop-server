import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Setting } from "../settings/entities/setting.entity"
import { Repository } from "typeorm"
import { Play2winSetting } from "../settings/entities/play2winSetting.entity"
import { CreatePlay2winSettingDto } from "../settings/dto/create-setting.dto"

@Injectable()
export class Play2WinSeeder implements Seeder {
  constructor(
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Play2winSetting) private readonly play2WinSettingRepository: Repository<Play2winSetting>
  ) {}

  async seed(): Promise<any> {
    const settings = await this.settingRepository.find()
    const setting = settings[0]

    const play2winSetting: CreatePlay2winSettingDto = {
      couponRedemptionFrequency: "Once Every 24 Hours",
      drawCycleResetTime: "08:00PM",
      loginRequiredToPlay: true,
      notifyAdminOnCouponExhaustion: true,
      playFrequency: "Once Every 24 Hours",
      redemptionWindowDays: 7,
      showWinnersNotification: true,
      settingId: setting.id,
      setting: setting
    }

    const play2winEntity = this.play2WinSettingRepository.create(play2winSetting)
    await this.play2WinSettingRepository.save(play2winEntity)
  }
  async drop(): Promise<any> {
    await this.play2WinSettingRepository.delete({})
  }
}
