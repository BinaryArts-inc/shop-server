import { User } from "../entity/user.entity"
import { IUserResponse } from "./user-response"

export abstract class UserResponseMapper implements IInterceptor {
  transform(data: User): IUserResponse {
    const latestSubscription =
      data.subscriptions?.length > 0
        ? data.subscriptions.reduce((latest, current) => (new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest))
        : null
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      kycStatus: data?.business?.kycStatus,
      itemsCount: data.itemsCount,
      profifleImage: data.profileImage,
      subscriptionStatus: latestSubscription?.status,
      ordersCount: data.ordersCount,
      email: data.email,
      isEmailVerified: data.isEmailVerified,
      lastTimeActivity: null,
      createdAt: data.createdAt,
      phoneNumber: data.phoneNumber
    }
  }
}
