import Business from "@/modules/users/entity/business.entity"
import { User } from "@/modules/users/entity/user.entity"

export interface IAuthResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    fullName: string
    createdAt: Date
    updatedAt: Date
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface AuthUserBusiness {
  user: User
  business: Business
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
