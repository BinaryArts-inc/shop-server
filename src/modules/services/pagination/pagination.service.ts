import { Injectable } from "@nestjs/common"
import { PaginatedResult } from "./interfaces/paginationResult.interface"
import { PaginationParams } from "./interfaces/paginationParams.interface"

@Injectable()
export class PaginationService {
  paginate<T>(data: T[], total: number, paginationParams: PaginationParams): PaginatedResult<T> {
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
        hasPreviousPage: page > 1
      }
    }
  }
}
