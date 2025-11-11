import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { CreateRevenueSettingDto } from "./dto/create-setting.dto"
import { UpdateRevenueSettingDto } from "./dto/update-setting.dto"
import { RevenueSetting } from "./entities/revenueSetting.entity"

@Injectable()
export class RevenueSettingService implements IService<RevenueSetting> {
  constructor(@InjectRepository(RevenueSetting) private readonly revenueSettingRepository: Repository<RevenueSetting>) {}

  async create(data: CreateRevenueSettingDto, manager?: EntityManager): Promise<RevenueSetting> {
    const repo = manager ? manager.getRepository<RevenueSetting>(RevenueSetting) : this.revenueSettingRepository
    const save = repo.create({ ...data })
    return await repo.save(save)
  }

  async find(): Promise<[RevenueSetting[], number]> {
    return await this.revenueSettingRepository.findAndCount()
  }

  async findById(id: string): Promise<RevenueSetting> {
    return await this.revenueSettingRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<RevenueSetting>): Promise<RevenueSetting> {
    return await this.revenueSettingRepository.findOne({ where: filter, relations: ["setting"] })
  }

  async exists(filter: FindOptionsWhere<RevenueSetting>): Promise<boolean> {
    return await this.revenueSettingRepository.exists({ where: filter })
  }

  async update(entity: RevenueSetting, data: UpdateRevenueSettingDto, manager?: EntityManager): Promise<RevenueSetting> {
    const repo = manager ? manager.getRepository<RevenueSetting>(RevenueSetting) : this.revenueSettingRepository
    const merge = repo.merge(entity, data)
    return await repo.save(merge)
  }

  async remove(filter: FindOptionsWhere<RevenueSetting>): Promise<number> {
    const remove = await this.revenueSettingRepository.delete(filter)
    return remove.affected || 0
  }
}
