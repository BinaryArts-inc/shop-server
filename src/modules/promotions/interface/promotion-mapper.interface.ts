import { Promotion } from "../entities/promotion.entity"
import { IPromotionResponse } from "./promotion-response.interface"

export abstract class PromotionResponseMapper implements IInterceptor {
  transform(data: Promotion): IPromotionResponse {
    return {
      id: data.id,
      name: data.name,
      amount: data.amount,
      duration: data.duration,
      type: data.type,
      createdAt: data.createdAt
    }
  }
}
