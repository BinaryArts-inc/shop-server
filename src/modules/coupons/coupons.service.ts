import { Injectable } from "@nestjs/common"
import { CreateCouponDto } from "./dto/create-coupon.dto"
import { UpdateCouponDto } from "./dto/update-coupon.dto"
import { Coupon } from "./entities/coupon.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { ICouponsQuery } from "./interface/query-filter.interface"
import { CouponStats } from "./interface/coupon-stats.interface"
import { NotFoundException } from "@/exceptions/notfound.exception"

@Injectable()
export class CouponsService implements IService<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>
  ) {}

  async create(data: CreateCouponDto, manager?: EntityManager): Promise<Coupon> {
    const repo = manager ? manager.getRepository(Coupon) : this.couponRepository
    const coupon = repo.create(data)
    return await repo.save(coupon)
  }

  async find({
    limit,
    page,
    startDate,
    endDate,
    couponType,
    quantity,
    remainingQuantity,
    search,
    orderBy = "ASC"
  }: ICouponsQuery): Promise<[Coupon[], number]> {
    const query = this.couponRepository.createQueryBuilder("coupon").orderBy("coupon.createdAt", orderBy)
    if (startDate && endDate) {
      query.andWhere("coupon.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate
      })
    }
    if (startDate) {
      query.andWhere("coupon.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("coupon.createdAt <= :endDate", { endDate })
    }

    if (couponType) {
      query.andWhere("coupon.couponType = :couponType", { couponType })
    }
    if (quantity) {
      query.andWhere("coupon.quantity = :quantity", { quantity })
    }
    if (remainingQuantity) {
      query.andWhere("coupon.remainingQuantity = :remainingQuantity", { remainingQuantity })
    }

    if (search) {
      query.andWhere("LOWER(coupon.title) LIKE :search OR LOWER(coupon.code) LIKE :search", {
        search: `%${search.toLowerCase()}%`
      })
    }
    return await query
      .take(limit)
      .skip(page && page > 0 ? (page - 1) * limit : 0)
      .getManyAndCount()
  }

  async findById(id: string): Promise<Coupon> {
    return await this.couponRepository.findOne({ where: { id } as FindOptionsWhere<Coupon> })
  }

  async findOne(filter: FindOptionsWhere<Coupon>): Promise<Coupon> {
    return await this.couponRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Coupon>): Promise<boolean> {
    const count = await this.couponRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Coupon, data: UpdateCouponDto, manager?: EntityManager): Promise<Coupon> {
    const repo = manager ? manager.getRepository(Coupon) : this.couponRepository
    const updated = repo.merge(entity, data)
    return await repo.save(updated)
  }

  async remove(filter: FindOptionsWhere<Coupon>): Promise<number> {
    const result = await this.couponRepository.delete(filter)
    return result.affected || 0
  }

  async couponStats(): Promise<CouponStats> {
    const query = await this.couponRepository
      .createQueryBuilder("coupon")
      .select("COUNT(coupon.id)", "count")
      .addSelect("SUM(coupon.quantity)", "totalQuantity")
      .addSelect("SUM(coupon.remainingQuantity)", "totalRemainingQuantity")
      .getRawOne()

    return {
      totalCoupons: parseInt(query.totalCoupons) || 0,
      totalQuantity: parseInt(query.totalQuantity) || 0,
      totalRemainingQuantity: parseInt(query.totalRemainingQuantity) || 0
    }
  }

  async findRandomCoupon(): Promise<Coupon> {
    const now = new Date()
    const coupon = await this.couponRepository
      .createQueryBuilder("coupon")
      .where("coupon.endDate >= :now", { now })
      .orderBy("RANDOM()")
      .limit(1)
      .getOne()

    if (!coupon) {
      throw new NotFoundException("No coupons available")
    }

    return coupon
  }
}
