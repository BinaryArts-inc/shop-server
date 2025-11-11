import * as joi from "joi"
import { PROMOTION_TYPE } from "../interface/promotion-type.interface"
import { PromotionTypeEnum } from "../entities/promotion.entity"

export class CreatePromotionDto {
  name: string
  type: PromotionTypeEnum
  duration: number
  amount: number
}

export const createPromotionSchema = joi.object({
  name: joi.string().required(),
  type: joi
    .string()
    .valid(...PROMOTION_TYPE)
    .required(),
  amount: joi.number().required(),
  duration: joi.number().required()
})
