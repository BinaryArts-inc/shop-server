import { PaginatedResult } from "@/modules/services/pagination/interfaces/paginationResult.interface"
import { IProductResponse } from "./product-response-interface"

export type IProductsResponse = PaginatedResult<IProductResponse>
