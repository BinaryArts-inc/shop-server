import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { FindOptionsWhere } from "typeorm"
import { Cart } from "../entities/cart.entity"

export interface IcartQuery extends PaginationParams, FindOptionsWhere<Cart> {
  // code?: string
}
