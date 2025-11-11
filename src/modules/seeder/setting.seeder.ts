import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Setting } from "../settings/entities/setting.entity"
import { Repository } from "typeorm"

@Injectable()
export class SettingSeeder implements Seeder {
  constructor(@InjectRepository(Setting) private settingRepository: Repository<Setting>) {}

  async seed(): Promise<any> {
    const settingEntity = this.settingRepository.create({})
    await this.settingRepository.save(settingEntity)
  }

  async drop(): Promise<any> {
    await this.settingRepository.delete({})
  }
}
