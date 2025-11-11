import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { FindOptionsWhere } from "typeorm"
import { Coupon } from "../entities/coupon.entity"

export interface ICouponsQuery extends PaginationParams, FindOptionsWhere<Coupon> {
  search?: string
  orderBy?: "ASC" | "DESC"
}
