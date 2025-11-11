import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"
import { IPromotionResponse } from "./promotion-response.interface"

export type IPromotionsResponse = PaginatedResult<IPromotionResponse>
