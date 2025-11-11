import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { Subscription } from "@/modules/subscription/entities/subscription.entity"
import { FindOptionsWhere } from "typeorm"

export interface ISubscriptionsQuery extends PaginationParams, FindOptionsWhere<Subscription> {
  startDate?: Date
  endDate?: Date
  search?: string
  orderBy?: "ASC" | "DESC"
}

export interface GetSubscriptionPayload {
  code: string
}
