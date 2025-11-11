import { KYC_ENUM_STATUS } from "@/modules/business/enum/kyc-status-enum"
import { UserRoleEnum } from "../entity/user.entity"
import { SubscriptionEnum } from "@/modules/subscription/entities/subscription.entity"

export interface IUserResponse {
  id: string
  firstName: string
  lastName: string
  role: UserRoleEnum
  subscriptionStatus: SubscriptionEnum
  profifleImage: string
  email: string
  kycStatus: KYC_ENUM_STATUS
  itemsCount: number
  ordersCount: number
  phoneNumber: string
  isEmailVerified: boolean
  lastTimeActivity: Date
  createdAt: Date
}
