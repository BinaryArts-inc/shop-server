import { Injectable } from "@nestjs/common"
import { CreatePromotionDto } from "./dto/create-promotion.dto"
import { UpdatePromotionDto } from "./dto/update-promotion.dto"
import { Promotion } from "./entities/promotion.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"

@Injectable()
export class PromotionsService implements IService<Promotion> {
  constructor(@InjectRepository(Promotion) private promotionRepository: Repository<Promotion>) {}

  async create(data: CreatePromotionDto, manager?: EntityManager): Promise<Promotion> {
    const repo = manager ? manager.getRepository<Promotion>(Promotion) : this.promotionRepository
    const promotion = repo.create({
      ...data
    })
    return await repo.save(promotion)
  }

  async find(): Promise<[Promotion[], number]> {
    return await this.promotionRepository.findAndCount()
  }

  async findById(id: string): Promise<Promotion> {
    return await this.promotionRepository.findOne({ where: { id: id } })
  }

  async findOne(filter: FindOptionsWhere<Promotion>): Promise<Promotion> {
    return await this.promotionRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Promotion>): Promise<boolean> {
    return await this.promotionRepository.exists({ where: filter })
  }

  async update(entity: Promotion, data: UpdatePromotionDto, manager?: EntityManager): Promise<Promotion> {
    const repo = manager ? manager.getRepository(Promotion) : this.promotionRepository

    const update = repo.create({ ...entity, ...data })

    return await repo.save(update)
  }

  async remove(filter: FindOptionsWhere<Promotion>): Promise<number> {
    const promotion = await this.promotionRepository.delete(filter)
    return promotion.raw
  }
}
