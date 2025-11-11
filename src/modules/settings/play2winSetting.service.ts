import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { Play2winSetting } from "./entities/play2winSetting.entity"
import { CreatePlay2winSettingDto } from "./dto/create-setting.dto"
import { UpdatePlay2winSettingDto } from "./dto/update-setting.dto"

@Injectable()
export class Play2winSettingService implements IService<Play2winSetting> {
  constructor(@InjectRepository(Play2winSetting) private readonly play2winSettingRepository: Repository<Play2winSetting>) {}

  async create(data: CreatePlay2winSettingDto, manager?: EntityManager): Promise<Play2winSetting> {
    const repo = manager ? manager.getRepository<Play2winSetting>(Play2winSetting) : this.play2winSettingRepository
    const save = repo.create({ ...data })
    return await repo.save(save)
  }

  async find(): Promise<[Play2winSetting[], number]> {
    return await this.play2winSettingRepository.findAndCount()
  }

  async findById(id: string): Promise<Play2winSetting> {
    return await this.play2winSettingRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<Play2winSetting>): Promise<Play2winSetting> {
    return await this.play2winSettingRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Play2winSetting>): Promise<boolean> {
    return await this.play2winSettingRepository.exists({ where: filter })
  }

  async update(entity: Play2winSetting, data: UpdatePlay2winSettingDto, manager?: EntityManager): Promise<Play2winSetting> {
    const repo = manager ? manager.getRepository<Play2winSetting>(Play2winSetting) : this.play2winSettingRepository
    const merge = repo.merge(entity, data)
    return await repo.save(merge)
  }

  async remove(filter: FindOptionsWhere<Play2winSetting>): Promise<number> {
    const remove = await this.play2winSettingRepository.delete(filter)
    return remove.affected || 0
  }
}
