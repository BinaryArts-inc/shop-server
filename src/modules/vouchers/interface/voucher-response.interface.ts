import { CouponEnumType } from "@/modules/coupons/enum/coupon-enum"
import { VoucherEnum } from "../enum/voucher-enum"

export interface IVoucherResponse {
  id: string
  status: VoucherEnum
  userId: string
  code: string
  dateWon: Date
  startDate: Date
  endDate: Date
  prizeWon: number
  prizeType: CouponEnumType
}
