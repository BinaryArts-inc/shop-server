import { Injectable } from "@nestjs/common"
import { PaginatedResult } from "./interfaces/pagination-result.interface"
import { PaginationParams } from "./interfaces/pagination-params.interface"

@Injectable()
export class PaginationService {
  paginate<T>(data: T[], total: number, paginationParams: PaginationParams, metadata: Record<string, any> = {}): PaginatedResult<T> {
    const { page = 1, limit = 10 } = paginationParams

    const totalPages = Math.ceil(total / limit)

    return {
      items: data,
      metadata: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        ...metadata
      }
    }
  }
}
