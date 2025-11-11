import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"
import { IPayoutResponse } from "./payout-response.interface"

export type IPayoutsResponse = PaginatedResult<IPayoutResponse>
