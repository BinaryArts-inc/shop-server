import { PromotionTypeEnum } from "@/modules/promotions/entities/promotion.entity"
import { AdStatus } from "./ad-status.interface"
import { IStoreShortResponse } from "@/modules/stores/interface/short-format-response.interface"

export interface IAdResponse {
  id: string
  type: PromotionTypeEnum
  status: AdStatus
  startDate: Date
  endDate: Date
  duration: number
  clicks: number
  impressions: number
  conversionRate: string
  vendor: {
    id: string
    fullName: string
    email: string
  }
  store: IStoreShortResponse
  product: {
    id: string
    name: string
    images: string[]
  }
}
