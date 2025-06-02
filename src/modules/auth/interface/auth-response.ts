import User from "@/modules/user/entity/user.entity"
import Business from "@/modules/user/entity/business.entity"

export interface IAuthResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    fullName: () => void
    createdAt: Date
    updatedAt: Date
  }
  store: {
    id: string
    name: string
    description: string
    logo: string
    createdAt: Date
    updatedAt: Date
  }
  tokens: {
    acecess_token: string
    refreshToken: string
  }
}

export interface AuthUserBusiness {
  user: User
  business: Business
  tokens: {
    acecess_token: string
    refreshToken: string
  }
}
