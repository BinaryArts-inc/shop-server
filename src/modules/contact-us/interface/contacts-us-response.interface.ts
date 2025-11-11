import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"
import { IContactUsResponse } from "./contact-us-response.interface"

export type IContactsUsResponse = PaginatedResult<IContactUsResponse>
