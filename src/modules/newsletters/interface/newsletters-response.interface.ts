import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"
import { INewsletterResponse } from "./newsletter-response.interface"

export type INewsLettersResponse = PaginatedResult<INewsletterResponse>
