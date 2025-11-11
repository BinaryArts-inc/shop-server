import { FindOptionsWhere } from "typeorm"

import { Order } from "../entities/order.entity"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

export interface IOrdersQuery extends PaginationParams, FindOptionsWhere<Order> {
  storeId?: string
  productId?: string
  startDate?: Date
  endDate?: Date
  orderBy?: "ASC" | "DESC"
  search?: string
}
