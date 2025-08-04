import * as joi from "joi"

import { PAYMENT_METHODS, PaymentMethod } from "@/modules/services/payments/interfaces/payment-method"
import { PromotionTypeEnum } from "@/modules/promotions/entities/promotion.entity"
import { AdStatus } from "../interfaces/ad-status.interface"

export class CreateAdDto {
  promotionId: string
  productId: string
  paymentMethod: PaymentMethod
  duration: number
  type: PromotionTypeEnum
  startDate?: Date
  endDate?: Date
  status?: AdStatus
}

export const createAdSchema = joi.object({
  promotionId: joi.string().required(),
  productId: joi.string().required(),
  paymentMethod: joi.string().valid(...PAYMENT_METHODS)
})
