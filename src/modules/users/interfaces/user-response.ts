import { KYC_ENUM_STATUS } from "@/modules/business/enum/kyc-status-enum"
import { UserRoleEnum } from "../entity/user.entity"
import { SubscriptionEnum } from "@/modules/subscription/entities/subscription.entity"

export interface IUserResponse {
  id: string
  firstName: string
  lastName: string
  role: UserRoleEnum
  email: string
  kycStatus: KYC_ENUM_STATUS
  subscriptionStatus: SubscriptionEnum
  itemsCount: number
  ordersCount: number
  phoneNumber: string
  isEmailVerified: boolean
  createdAt: Date
}
