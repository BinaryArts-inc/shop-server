import { FindOptionsWhere } from "typeorm"
import { Ad } from "../entities/ad.entity"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

export interface IAdsQuery extends PaginationParams, FindOptionsWhere<Ad> {
  storeId?: string
  vendorId?: string
  startDate?: Date
  endDate?: Date
  adStatus?: string[]
}
