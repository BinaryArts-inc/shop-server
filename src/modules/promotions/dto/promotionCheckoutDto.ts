import * as joi from "joi"
import { PAYMENT_METHODS, PaymentMethod } from "../../services/payments/interfaces/payment-method"

export class PromotionCheckoutDto {
  promotionId: string
  productId: string
  paymentMethod: PaymentMethod
}

export const PromotionCheckoutSchema = joi.object({
  promotionId: joi.string().required(),
  productId: joi.string().required(),
  paymentMethod: joi.string().valid(...PAYMENT_METHODS)
})
