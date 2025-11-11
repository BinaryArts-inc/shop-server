import { Injectable } from "@nestjs/common"
import { CreateSubscriptionDto } from "./dto/create-subscription.dto"
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto"
import { Subscription } from "./entities/subscription.entity"
import { Between, EntityManager, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { GetSubscriptionPayload, ISubscriptionsQuery } from "./interface/query-filter.interface"
import { PaymentsService } from "../services/payments/payments.service"
import { Queue } from "bullmq"
import { InjectQueue } from "@nestjs/bullmq"
import { AppQueues } from "@/constants"
import { MonthlySubscriptionRevenue, SubscriptionRevenueInterface } from "./interface/subcription-revenue.interface"

@Injectable()
export class SubscriptionService implements IService<Subscription>, UseQueue<string, Subscription> {
  private relations = ["vendor", "vendor.business", "vendor.business.store"]
  constructor(
    @InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>,
    @InjectQueue(AppQueues.END_SUBSCRIPTION) private queue: Queue,
    private paymentService: PaymentsService
  ) {}

  async create(data: CreateSubscriptionDto, manager?: EntityManager): Promise<Subscription> {
    const repo = manager ? manager.getRepository<Subscription>(Subscription) : this.subscriptionRepository

    const createSubcription = repo.create({ ...data })

    const subscription = await repo.save(createSubcription)

    return subscription
  }

  async find({
    page,
    limit,
    planType,
    status,
    vendorId,
    startDate,
    endDate,
    search,
    orderBy = "DESC"
  }: ISubscriptionsQuery): Promise<[Subscription[], number]> {
    const query = this.subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.vendor", "vendor")
      .leftJoinAndSelect("vendor.business", "business")
      .leftJoinAndSelect("business.store", "store")
      .orderBy("subscription.createdAt", orderBy)

    if (planType) {
      query.andWhere("subscription.planType = :planType", { planType })
    }

    if (status) {
      query.andWhere("subscription.status = :status", { status })
    }

    if (vendorId) {
      query.andWhere("subscription.vendorId = :vendorId", { vendorId })
    }

    if (startDate && endDate) {
      query.andWhere("subscription.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
    } else if (startDate) {
      query.andWhere("subscription.createdAt >= :startDate", { startDate })
    } else if (endDate) {
      query.andWhere("subscription.createdAt <= :endDate", { endDate })
    }

    if (search) {
      query.andWhere("LOWER(vendor.firstName) LIKE :search OR LOWER(vendor.lastName) LIKE :search OR LOWER(store.name) LIKE :search", {
        search: `%${search.toLowerCase()}%`
      })
    }

    return await query
      .take(limit)
      .skip(page && page > 0 ? (page - 1) * limit : 0)
      .getManyAndCount()
  }

  async findById(id: string): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: { id: id }, relations: this.relations })
  }

  async findOne(filter: FindOptionsWhere<Subscription>): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: filter, relations: this.relations })
  }

  async exists(filter: FindOptionsWhere<Subscription>): Promise<boolean> {
    return await this.subscriptionRepository.exists({ where: filter, relations: this.relations })
  }

  async update(entity: Subscription, data: UpdateSubscriptionDto, manager?: EntityManager): Promise<Subscription> {
    const repo = manager ? manager.getRepository(Subscription) : this.subscriptionRepository

    const update = repo.create({ ...entity, ...data })

    return await repo.save(update)
  }

  async remove(filter: FindOptionsWhere<Subscription>): Promise<number> {
    const result = await this.subscriptionRepository.delete(filter)
    return result.raw
  }

  async dispatch({ name, data }: QueueDispatch<string, Subscription>) {
    const delay = new Date(data.endDate).getTime() - Date.now()
    if (delay > 0) {
      await this.queue.add(name, data, { delay })
    } else {
      await this.queue.add(name, data)
    }
  }

  async getStartAndEndDate(planType: string) {
    const startDate = new Date()
    let endDate: Date

    if (planType === "monthly") {
      endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (planType === "quarterly") {
      endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)
    } else if (planType === "annually") {
      endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      throw new Error("Invalid plan type")
    }

    return { startDate, endDate }
  }

  async getSubscription({ code }: GetSubscriptionPayload) {
    const getSubscription = await this.paymentService.getSubscription({ code })
    return getSubscription
  }

  async calculateSubscriptionsTotalRevenue({ startDate, endDate, isPaid }: SubscriptionRevenueInterface): Promise<number> {
    const where: FindOptionsWhere<Subscription> = {}
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate)
    }

    if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate)
    }

    if (endDate) {
      where.createdAt = LessThanOrEqual(endDate)
    }
    if (isPaid) {
      where.isPaid = isPaid
    }

    return await this.subscriptionRepository.sum("amount", where)
  }

  async getSubscriptionMonthlyRevenue({ startDate, endDate, isPaid }: SubscriptionRevenueInterface): Promise<MonthlySubscriptionRevenue[]> {
    const result = await this.subscriptionRepository
      .createQueryBuilder("subscription")
      .select("EXTRACT(YEAR FROM subscription.createdAt)::integer", "year")
      .addSelect("EXTRACT(MONTH FROM subscription.createdAt)::integer", "month")
      .addSelect("SUM(subscription.amount)", "total")
      .where("subscription.isPaid = :isPaid", { isPaid })
      .andWhere("subscription.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate
      })
      .groupBy("year, month")
      .orderBy("year, month", "ASC")
      .getRawMany()

    const monthlyData = result.map((row) => ({
      year: row.year,
      month: row.month,
      total: parseFloat(row.total) || 0
    }))

    return monthlyData
  }

  async findLatestByUserId(userId: string) {
    return await this.subscriptionRepository
      .createQueryBuilder("subscription")
      .where("subscription.vendorId = :userId", { userId })
      .orderBy("subscription.createdAt", "DESC")
      .getOne()
  }
}
