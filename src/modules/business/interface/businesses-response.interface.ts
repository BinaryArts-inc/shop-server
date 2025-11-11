import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"
import { IBusinessResponse } from "./business-response.interface"

export type IBusinessesResponse = PaginatedResult<IBusinessResponse>
