import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { FindOptionsWhere } from "typeorm"
import { Commision } from "../entities/commision.entity"

export interface ICommisionQuery extends PaginationParams, FindOptionsWhere<Commision> {
  startDate?: Date
  endDate?: Date
}
