import { PromotionType } from "./promotion-type.interface"

export interface IPromotionResponse {
  id: string
  name: string
  amount: number
  type: PromotionType
  duration: number
  createdAt: Date
}
