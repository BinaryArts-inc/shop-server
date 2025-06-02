import { SetMetadata } from "@nestjs/common"

export const USE_PAGINATION = "usePagination"
export const UsePagination = () => SetMetadata(USE_PAGINATION, true)
