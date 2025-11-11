import { Injectable } from "@nestjs/common"
import { CreateSettingDto } from "./dto/create-setting.dto"
import { UpdateSettingDto } from "./dto/update-setting.dto"
import { Setting } from "./entities/setting.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"

@Injectable()
export class SettingsService implements IService<Setting> {
  constructor(@InjectRepository(Setting) private readonly settingRepository: Repository<Setting>) {}

  readonly relations = ["revenueSetting", "promotionSetting", "play2winSetting", "generalSetting"]

  async create(data: CreateSettingDto, manager?: EntityManager): Promise<Setting> {
    const repo = manager ? manager.getRepository<Setting>(Setting) : this.settingRepository
    const save = repo.create({ ...data })
    return await repo.save(save)
  }

  async find(): Promise<[Setting[], number]> {
    return this.settingRepository
      .createQueryBuilder("setting")
      .leftJoinAndSelect("setting.revenueSetting", "revenue")
      .leftJoinAndSelect("setting.promotionSetting", "promotion")
      .leftJoinAndSelect("setting.play2winSetting", "play2win")
      .leftJoinAndSelect("setting.generalSetting", "generalSetting")
      .getManyAndCount()
  }

  async findById(id: string): Promise<Setting> {
    return await this.settingRepository.findOne({ where: { id }, relations: this.relations })
  }

  async findOne(filter: FindOptionsWhere<Setting>): Promise<Setting> {
    return await this.settingRepository.findOne({ where: filter, relations: this.relations })
  }

  async exists(filter: FindOptionsWhere<Setting>): Promise<boolean> {
    return await this.settingRepository.exists({ where: filter })
  }

  async update(entity: Setting, data: UpdateSettingDto, manager?: EntityManager): Promise<Setting> {
    const repo = manager ? manager.getRepository<Setting>(Setting) : this.settingRepository
    const merge = repo.merge(entity, data)
    return await repo.save(merge)
  }
  async remove(filter: FindOptionsWhere<Setting>): Promise<number> {
    const remove = await this.settingRepository.delete(filter)
    return remove.affected || 0
  }

  async getSettings(): Promise<Setting> {
    const settings = await this.settingRepository.find()
    return settings[0]
  }

  async addFulfilmentFeeToOrderAmount(amount: number): Promise<{ totalFee: number; fulfillmentFeePercentage: number; percentageAmount: number }> {
    const settings = await this.findOneSetting()
    const percentageAmount = (amount * settings.revenueSetting.fulfillmentFeePercentage) / 100
    const totalFee = amount + percentageAmount
    return { totalFee, fulfillmentFeePercentage: settings.revenueSetting.fulfillmentFeePercentage, percentageAmount }
  }

  async findOneSetting(): Promise<Setting> {
    return this.settingRepository
      .createQueryBuilder("setting")
      .leftJoinAndSelect("setting.revenueSetting", "revenue")
      .leftJoinAndSelect("setting.promotionSetting", "promotion")
      .leftJoinAndSelect("setting.play2winSetting", "play2win")
      .leftJoinAndSelect("setting.generalSetting", "generalSetting")
      .getOne()
  }
}
