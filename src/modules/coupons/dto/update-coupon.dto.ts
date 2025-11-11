import { PartialType } from "@nestjs/mapped-types"
import { CreateCouponDto } from "./create-coupon.dto"
import * as joi from "joi"

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export const updateCouponSchema = joi.object({
  title: joi.string().optional(),
  couponType: joi.string().valid("percentage", "amount").optional(),
  value: joi.number().optional,
  startDate: joi.date().optional(),
  endDate: joi.date().optional()
})
