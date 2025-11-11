# Pagination Service

The `PaginationService` provides a simple, reusable way to paginate arrays of data or query results, with metadata about the current page, total items, and total pages. It can be extended to integrate with TypeORM or any custom queries.

---

## Installation / Module Registration

First, import the `PaginationModule` in your NestJS module:

```ts
import { Module } from '@nestjs/common'
import { PaginationModule } from './services/pagination/pagination.module'
import { MyService } from './my.service'

@Module({
  imports: [PaginationModule],
  providers: [MyService]
})
export class MyModule {}
```

Then inject the service wherever needed:

```ts
import { Injectable } from '@nestjs/common'
import { PaginationService } from './services/pagination/pagination.service'

@Injectable()
export class MyService {
  constructor(private readonly pagination: PaginationService) {}

  async getPaginatedItems(items: any[], page = 1, limit = 10) {
    return this.pagination.paginate(items, items.length, { page, limit })
  }
}
```

---

## Interfaces

### `PaginationParams`

Optional parameters to control pagination:

```ts
export interface PaginationParams {
  page?: number // Current page (default 1)
  limit?: number // Items per page (default 10)
}
```

### `PaginatedResult<T>`

The returned paginated structure:

```ts
export interface PaginatedResult<T> {
  items: T[] // Current page items
  metadata: {
    total: number       // Total items
    page: number        // Current page
    limit: number       // Items per page
    totalPages: number  // Total number of pages
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
```

---

## Usage

```ts
const items = [/* large array */]
const total = items.length
const paginationParams = { page: 2, limit: 5 }

const paginated = paginationService.paginate(items, total, paginationParams)

console.log(paginated.metadata)
/* Example output:
{
  total: 20,
  page: 2,
  limit: 5,
  totalPages: 4,
  hasNextPage: true,
  hasPreviousPage: true
}
*/
```

---

## Comments on the Implementation

* `PaginationService.paginate<T>()`:

  * Accepts any array of data and total count.
  * Calculates `totalPages` from `total` and `limit`.
  * Returns the array for the current page and metadata.
  * Supports optional `page` and `limit` (defaults to 1 and 10).

* Lightweight, generic, and reusable across all modules.

---
