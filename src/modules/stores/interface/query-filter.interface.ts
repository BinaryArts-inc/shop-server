import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { Store } from "@/modules/stores/entities/store.entity"
import { FindOptionsWhere } from "typeorm"

export interface IStoresQuery extends PaginationParams, FindOptionsWhere<Store> {
  flag?: "top"
}
