import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { FindOptionsWhere } from "typeorm"
import { Review } from "../entities/review.entity"

export interface IReviewQuery extends PaginationParams, FindOptionsWhere<Review> {}
