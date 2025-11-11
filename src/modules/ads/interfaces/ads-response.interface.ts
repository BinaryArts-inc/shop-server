import { IAdResponse } from "./ad-response.interface"
import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"

export type IAdsResponse = PaginatedResult<IAdResponse>
