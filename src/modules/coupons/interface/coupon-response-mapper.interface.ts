import { Coupon } from "../entities/coupon.entity"
import { ICouponResponse } from "./coupon-response.interface"

export abstract class CouponResponseMapper implements IInterceptor {
  transform(data: Coupon): ICouponResponse {
    return {
      id: data.id,
      code: data.code,
      title: data.title,
      quantity: data.quantity,
      remainingQuantity: data.remainingQuantity,
      couponType: data.couponType,
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate
    }
  }
}
