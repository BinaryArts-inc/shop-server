import { SetMetadata } from "@nestjs/common"

export const IS_SHORT_TIME = "isShortTime"
export const Short_Time = () => SetMetadata(IS_SHORT_TIME, true)
