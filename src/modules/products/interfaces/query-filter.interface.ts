import { PaginationParams } from "@/modules/services/pagination/interfaces/paginationParams.interface"
import { ProductStatusEnum } from "../entities/product.entity"

export interface IProductsQuery extends PaginationParams {
  status?: ProductStatusEnum
  stockCount?: number
  storeId: string
}
