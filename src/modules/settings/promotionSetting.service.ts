import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { CreatePromotionSettingDto } from "./dto/create-setting.dto"
import { PromotionSetting } from "./entities/promotionSetting.entity"
import { UpdatePromotionSettingDto } from "./dto/update-setting.dto"

@Injectable()
export class PromotionSettingService implements IService<PromotionSetting> {
  constructor(@InjectRepository(PromotionSetting) private readonly promotionSettingRepository: Repository<PromotionSetting>) {}

  async create(data: CreatePromotionSettingDto, manager?: EntityManager): Promise<PromotionSetting> {
    const repo = manager ? manager.getRepository<PromotionSetting>(PromotionSetting) : this.promotionSettingRepository
    const save = repo.create({ ...data })
    return await repo.save(save)
  }

  async find(): Promise<[PromotionSetting[], number]> {
    return await this.promotionSettingRepository.findAndCount()
  }

  async findById(id: string): Promise<PromotionSetting> {
    return await this.promotionSettingRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<PromotionSetting>): Promise<PromotionSetting> {
    return await this.promotionSettingRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<PromotionSetting>): Promise<boolean> {
    return await this.promotionSettingRepository.exists({ where: filter })
  }

  async update(entity: PromotionSetting, data: UpdatePromotionSettingDto, manager?: EntityManager): Promise<PromotionSetting> {
    const repo = manager ? manager.getRepository<PromotionSetting>(PromotionSetting) : this.promotionSettingRepository
    const merge = repo.merge(entity, data)
    return await repo.save(merge)
  }

  async remove(filter: FindOptionsWhere<PromotionSetting>): Promise<number> {
    const remove = await this.promotionSettingRepository.delete(filter)
    return remove.affected || 0
  }
}
