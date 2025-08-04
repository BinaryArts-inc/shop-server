import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Not, Repository } from "typeorm"

import { Ad } from "./entities/ad.entity"
import { CreateAdDto } from "./dto/create-ad.dto"
import { UpdateAdDto } from "./dto/update-ad.dto"
import { IAdsQuery } from "./interfaces/query-interface-filter"
import { InjectQueue } from "@nestjs/bullmq"
import { AppQueues } from "@/constants"
import { Queue } from "bullmq"

@Injectable()
export class AdsService implements IService<Ad>, UseQueue<string, Ad> {
  constructor(
    @InjectRepository(Ad) private adRepository: Repository<Ad>,
    @InjectQueue(AppQueues.END_ADS) private queue: Queue
  ) {}

  async create(data: CreateAdDto, manager?: EntityManager): Promise<Ad> {
    const repo = manager ? manager.getRepository(Ad) : this.adRepository
    const ad = repo.create(data)
    return await repo.save(ad)
  }

  async find({ productId, vendorId, type, storeId, limit, page }: IAdsQuery): Promise<[Ad[], number]> {
    const where: FindOptionsWhere<Ad> = { status: Not("inactive") }

    if (productId) {
      where.productId = productId
    }

    if (vendorId) {
      where.product = { user: { id: vendorId } }
    }

    if (type) {
      where.type = type
    }

    if (storeId) {
      where.product = { storeId }
    }

    return await this.adRepository.findAndCount({
      where,
      take: limit,
      skip: page ? page - 1 : undefined
    })
  }

  async findById(id: string): Promise<Ad> {
    return await this.findOne({ id })
  }

  async findOne(filter: FindOptionsWhere<Ad>): Promise<Ad> {
    return await this.adRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Ad>): Promise<boolean> {
    return await this.adRepository.exists({ where: filter })
  }

  async update(entity: Ad, data: UpdateAdDto, manager?: EntityManager): Promise<Ad> {
    const repo = manager ? manager.getRepository(Ad) : this.adRepository
    const updatedEntity = repo.merge(entity, data)
    return await repo.save(updatedEntity)
  }

  async remove(filter: FindOptionsWhere<Ad>): Promise<number> {
    const result = await this.adRepository.delete(filter)
    return result.affected || 0
  }

  async dispatch({ name, data }: QueueDispatch<string, Ad>) {
    this.queue.add(name, data, { delay: data.duration * 24 * 60 * 60 * 1000 })
  }

  async calculateStartAndEndDate(duration: number): Promise<{ startDate: Date; endDate: Date }> {
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (duration - 1))
    return { startDate, endDate }
  }
}
