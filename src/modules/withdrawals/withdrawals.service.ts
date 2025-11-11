import { Injectable } from "@nestjs/common"
import { Withdrawal } from "./entities/withdrawal.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { CreateWithdrawalDto } from "./dto/create-withdrawal.dto"
import { IWithdrawalQuery } from "./interfaces/query-filter.interface"

@Injectable()
export class WithdrawalsService implements IService<Withdrawal> {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>
  ) {}

  // private relations = ["payout", "bank", "bank"]

  async create(data: CreateWithdrawalDto, manager?: EntityManager): Promise<Withdrawal> {
    const repo = manager ? manager.getRepository(Withdrawal) : this.withdrawalRepository
    const withdrawal = repo.create(data)
    return repo.save(withdrawal)
  }

  async find(filter: IWithdrawalQuery): Promise<[Withdrawal[], number]> {
    const where: FindOptionsWhere<Withdrawal> = {}

    if (filter.payoutId) {
      where.payout = { id: filter.payoutId }
    }

    if (filter.status) {
      where.status = filter.status
    }

    const [items, count] = await this.withdrawalRepository.findAndCount({
      where,
      relations: ["payout", "processedBy"]
    })

    return [items, count]
  }

  async findById(id: string): Promise<Withdrawal> {
    return this.withdrawalRepository.findOne({ where: { id }, relations: ["payout"] })
  }

  async findOne(filter: FindOptionsWhere<Withdrawal>): Promise<Withdrawal> {
    return await this.withdrawalRepository.findOne({ where: filter, relations: ["payout"] })
  }

  async exists(filter: FindOptionsWhere<Withdrawal>): Promise<boolean> {
    const count = await this.withdrawalRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Withdrawal, data: Partial<Withdrawal>, manager?: EntityManager): Promise<Withdrawal> {
    const repo = manager ? manager.getRepository(Withdrawal) : this.withdrawalRepository
    Object.assign(entity, data)
    return repo.save(entity)
  }

  async remove(filter: FindOptionsWhere<Withdrawal>): Promise<number> {
    const result = await this.withdrawalRepository.delete(filter)
    return result.affected || 0
  }

  async getWithdrawalStats(payoutId: string): Promise<{
    pendingWithdrawalCount: number
    lastPayout: Date
  }> {
    const pendingWithdrawalCount = await this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .leftJoinAndSelect("withdrawal.payout", "payout")
      .where("payout.id = :payoutId", { payoutId })
      .andWhere("withdrawal.status = :status", { status: "pending" })
      .getCount()

    const lastPayout = await this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .leftJoinAndSelect("withdrawal.payout", "payout")
      .where("payout.id = :payoutId", { payoutId })
      .andWhere("withdrawal.status = :status", { status: "success" })
      .orderBy("withdrawal.createdAt", "DESC")
      .getOne()

    return {
      pendingWithdrawalCount,
      lastPayout: lastPayout?.createdAt
    }
  }
}
