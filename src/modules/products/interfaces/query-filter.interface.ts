import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { vendonEnumType } from "@/modules/stores/entities/store.entity"
import { Product } from "../entities/product.entity"
import { FindOptionsWhere } from "typeorm"

export interface IProductsQuery extends PaginationParams, FindOptionsWhere<Product> {
  categories?: string
  search?: string
  vendor?: vendonEnumType
  flag?: "top" | "featured" | "handpicked" | "banner" | "search"
  orderBy?: "ASC" | "DESC"
  sortBy?: "ASC" | "DESC" // sort using product price from lowest to highest
  rating?: number
  userId?: string
}
