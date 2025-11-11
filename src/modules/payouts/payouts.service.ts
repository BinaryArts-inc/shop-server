import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindManyOptions, FindOptionsWhere, MoreThan, Repository } from "typeorm"

import { Payout } from "./entities/payout.entity"
import { IPayoutQuery } from "./interfaces/query-filter.interface"
import { PayoutStats } from "./interfaces/payout-stats"

@Injectable()
export class PayoutsService implements IService<Payout> {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>
  ) {}

  async create(data: Partial<Payout>, manager?: EntityManager): Promise<Payout> {
    const repo = manager ? manager.getRepository(Payout) : this.payoutRepository
    const payout = repo.create(data)
    return repo.save(payout)
  }

  async find({ limit, page, storeId, flag }: IPayoutQuery): Promise<[Payout[], number]> {
    const where: FindManyOptions<Payout>["where"] = {}

    if (storeId) {
      where.storeId = storeId
    }

    if (flag === "pending") {
      where.pending = MoreThan(0)
    }

    return this.payoutRepository.findAndCount({ where, take: limit, skip: page ? page - 1 : undefined })
  }

  async findById(id: string): Promise<Payout> {
    return this.payoutRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<Payout>): Promise<Payout> {
    return await this.payoutRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Payout>): Promise<boolean> {
    const count = await this.payoutRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Payout, data: Partial<Payout>, manager?: EntityManager): Promise<Payout> {
    const repo = manager ? manager.getRepository(Payout) : this.payoutRepository
    Object.assign(entity, data)
    return repo.save(entity)
  }

  async remove(filter: FindOptionsWhere<Payout>): Promise<number> {
    const result = await this.payoutRepository.delete(filter)
    return result.affected || 0
  }

  async payoutStats(): Promise<PayoutStats> {
    const result = await this.payoutRepository
      .createQueryBuilder("payout")
      .select("SUM(payout.withdrawn)", "totalPayoutsPaid")
      .addSelect("SUM(payout.available)", "walletBalance")
      .addSelect("SUM(payout.pending)", "pendingPayouts")
      .getRawOne()

    return {
      totalPayoutsPaid: parseFloat(result.totalPayoutsPaid) || 0,
      walletBalance: parseFloat(result.walletBalance) || 0,
      pendingPayouts: parseFloat(result.pendingPayouts) || 0
    }
  }
}
