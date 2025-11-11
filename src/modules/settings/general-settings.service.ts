import { Injectable } from "@nestjs/common"
import { GeneralSetting } from "./entities/general.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { CreateGeneralSettingDto } from "./dto/create-setting.dto"
import { UpdateGeneralSettingDto } from "./dto/update-setting.dto"

@Injectable()
export class GeneralSettingService implements IService<GeneralSetting> {
  constructor(
    @InjectRepository(GeneralSetting)
    private readonly generalSettingRepository: Repository<GeneralSetting>
  ) {}

  async create(data: CreateGeneralSettingDto, manager?: EntityManager): Promise<GeneralSetting> {
    const repo = manager ? manager.getRepository(GeneralSetting) : this.generalSettingRepository
    const entity = repo.create(data)
    return await repo.save(entity)
  }

  async find(data: FindOptionsWhere<GeneralSetting>): Promise<[GeneralSetting[], number]> {
    return await this.generalSettingRepository.findAndCount({ where: data })
  }

  async findById(id: string): Promise<GeneralSetting> {
    return await this.findOne({ id })
  }

  async findOne(filter: FindOptionsWhere<GeneralSetting>): Promise<GeneralSetting> {
    return await this.generalSettingRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<GeneralSetting>): Promise<boolean> {
    return await this.generalSettingRepository.exists({ where: filter })
  }

  async update(entity: GeneralSetting, data: UpdateGeneralSettingDto, manager?: EntityManager): Promise<GeneralSetting> {
    const repo = manager ? manager.getRepository(GeneralSetting) : this.generalSettingRepository
    const settings = repo.merge(entity, data)
    return await repo.save(settings)
  }

  async remove(filter: FindOptionsWhere<GeneralSetting>): Promise<number> {
    const result = await this.generalSettingRepository.delete(filter)
    return result.affected || 0
  }
}
