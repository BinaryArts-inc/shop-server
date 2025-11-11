import { CouponEnumType } from "@/modules/coupons/enum/coupon-enum"
import { VoucherEnum } from "../enum/voucher-enum"

export class CreateVoucherDto {
  userId: string
  code: string
  dateWon: Date
  orderId?: string
  status?: VoucherEnum
  prizeWon: number
  prizeType: CouponEnumType
  startDate: Date
  endDate: Date
}
