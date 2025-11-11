import { CouponEnumType } from "../enum/coupon-enum"
import * as joi from "joi"

export class CreateCouponDto {
  title: string
  code: string
  quantity: number
  remainingQuantity: number
  couponType: CouponEnumType
  value: number
  startDate: Date
  endDate: Date
}

export const createCouponSchema = joi.object({
  title: joi.string().required(),
  value: joi.number().required(),
  quantity: joi.number().required(),
  couponType: joi.string().valid("discount", "amount").required(),
  startDate: joi.date().required(),
  endDate: joi.date().required()
})
