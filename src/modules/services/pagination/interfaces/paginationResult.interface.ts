export interface PaginatedResult<T> {
  items: T[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
