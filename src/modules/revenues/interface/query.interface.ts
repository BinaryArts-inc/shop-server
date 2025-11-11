import { AdStatus } from "@/modules/ads/interfaces/ad-status.interface"
import { OrderStatus } from "@/modules/orders/interfaces/order-status"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

export interface IRevenueQuery extends PaginationParams {
  startDate?: Date
  endDate?: Date
  storeId?: string
  adsStatus?: AdStatus
  orderStatus?: OrderStatus
  flag?: "paid" | "unpaid"
}
