import { CouponEnumType } from "../enum/coupon-enum"

export interface ICouponResponse {
  id: string
  title: string
  code: string
  quantity: number
  remainingQuantity: number
  couponType: CouponEnumType
  value: number
  startDate: Date
  endDate: Date
}
