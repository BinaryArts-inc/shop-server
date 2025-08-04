import { Injectable } from "@nestjs/common"
import { CreateSubscriptionDto } from "./dto/create-subscription.dto"
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto"
import { Subscription } from "./entities/subscription.entity"
import { EntityManager, FindManyOptions, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { GetSubscriptionPayload, ISubscriptionsQuery } from "./interface/query-filter.interface"
import { PaymentsService } from "../services/payments/payments.service"
import { Queue } from "bullmq"
import { InjectQueue } from "@nestjs/bullmq"
import { AppQueues } from "@/constants"

@Injectable()
export class SubscriptionService implements IService<Subscription>, UseQueue<string, Subscription> {
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

  async find({ page, limit, planType, status, vendorId }: ISubscriptionsQuery): Promise<[Subscription[], number]> {
    const where: FindManyOptions<Subscription>["where"] = {}

    if (planType) {
      where.planType = planType
    }

    if (status) {
      where.status = status
    }

    if (vendorId) {
      where.vendorId = vendorId
    }

    return await this.subscriptionRepository.findAndCount({
      where,
      take: limit,
      skip: page ? page - 1 : undefined,
      relations: ["vendor", "vendor.business", "vendor.business.store", "vendor.business.store.product"]
    })
  }

  async findById(id: string): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: { id: id } })
  }

  async findOne(filter: FindOptionsWhere<Subscription>): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({ where: filter, relations: ["vendor", "vendor.business", "vendor.business.store"] })
  }

  async exists(filter: FindOptionsWhere<Subscription>): Promise<boolean> {
    return await this.subscriptionRepository.exists({ where: filter, relations: ["vendor", "vendor.business", "vendor.business.store"] })
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
}
