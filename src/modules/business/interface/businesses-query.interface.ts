import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { FindOptionsWhere } from "typeorm"
import Business from "../entities/business.entity"

export interface IBusinessQuery extends PaginationParams, FindOptionsWhere<Business> {}
