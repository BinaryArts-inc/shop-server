import { PartialType } from "@nestjs/mapped-types"
import { CreatePromotionDto } from "./create-promotion.dto"
import * as joi from "joi"
import { PROMOTION_TYPE } from "../interface/promotion-type.interface"

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

export const updatePromotionSchema = joi.object({
  name: joi.string().optional(),
  type: joi
    .string()
    .valid(...PROMOTION_TYPE)
    .optional(),
  amount: joi.number().optional(),
  duration: joi.number().optional()
})
