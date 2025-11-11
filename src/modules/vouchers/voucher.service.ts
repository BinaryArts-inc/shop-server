import { Injectable } from "@nestjs/common"
import { CreateVoucherDto } from "./dto/create-voucher.dto"
import { UpdateVoucherDto } from "./dto/update-voucher.dto"
import { Voucher } from "./entities/voucher.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { IVoucherQueryFilter } from "./interface/query-filter"
import { CouponEnumType } from "../coupons/enum/coupon-enum"

@Injectable()
export class VoucherService implements IService<Voucher> {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>
  ) {}

  async create(data: CreateVoucherDto, manager?: EntityManager): Promise<Voucher> {
    const repo = manager ? manager.getRepository(Voucher) : this.voucherRepository
    const voucher = repo.create(data)
    return await repo.save(voucher)
  }

  async find({ limit, page, status, userId }: IVoucherQueryFilter): Promise<[Voucher[], number]> {
    const where: FindOptionsWhere<Voucher> = {}
    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }
    const skip = page && page > 0 ? (page - 1) * limit : 0
    const [result, count] = await this.voucherRepository.findAndCount({
      where,
      skip,
      take: limit
    })
    return [result, count]
  }

  async findById(id: string): Promise<Voucher> {
    return await this.voucherRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<Voucher>): Promise<Voucher> {
    return await this.voucherRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Voucher>): Promise<boolean> {
    const count = await this.voucherRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Voucher, data: UpdateVoucherDto, manager?: EntityManager): Promise<Voucher> {
    const repo = manager ? manager.getRepository(Voucher) : this.voucherRepository
    const updated = repo.merge(entity, data)
    return await repo.save(updated)
  }

  async remove(filter: FindOptionsWhere<Voucher>): Promise<number> {
    const vouchers = await this.voucherRepository.find({ where: filter })
    const result = await this.voucherRepository.remove(vouchers)
    return result.length
  }

  applyVoucher(voucher: Voucher, amount: number): number {
    if (voucher.prizeType === CouponEnumType.AMOUNT) {
      return amount - voucher.prizeWon
    } else {
      return amount - (amount * voucher.prizeWon) / 100
    }
  }
}
