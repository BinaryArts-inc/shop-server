import { SetMetadata } from "@nestjs/common"

export const IS_SHORT_TIME = "isShortTime"
export const ShortTime = () => SetMetadata(IS_SHORT_TIME, true)
