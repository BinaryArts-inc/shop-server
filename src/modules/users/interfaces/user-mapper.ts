import { User } from "../entity/user.entity"
import { IUserResponse } from "./user-response"

export abstract class UserResponseMapper implements IInterceptor {
  transform(data: User): IUserResponse {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      itemsCount: data.itemsCount,
      kycStatus: data.business?.kycStatus,
      ordersCount: data.ordersCount,
      email: data.email,
      isEmailVerified: data.isEmailVerified,
      createdAt: data.createdAt,
      phoneNumber: data.phoneNumber
    }
  }
}
