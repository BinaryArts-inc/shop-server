import { UserRoleEnum } from "@/modules/users/entity/user.entity"
import { WithdrawalStatus } from "./withdraw-status.interface"

export interface IWithdrawalResponse {
  id: string
  amount: number
  date: string
  status: WithdrawalStatus
  walletBalance: number
  bank: {
    id: string
    name: string
    firstThreeDigits: string
    lastThreeDigits: string
  }
  store: {
    name: string
  }
  user: {
    role: UserRoleEnum
  }
  processedBy?: string
  dateProccess?: Date
}
