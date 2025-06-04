import { AuthUserBusiness, IAuthResponse } from "./auth-response"

export abstract class AuthResponseMapper implements IInterceptor {
  transform(data: AuthUserBusiness): IAuthResponse {
    return {
      user: {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        email: data.user.email,
        fullName: data.user.fullName,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      },
      store: {
        id: data.user.business.store.id,
        name: data.user.business.store.name,
        logo: data.user.business.store.logo,
        description: data.user.business.store.description,
        createdAt: data.user.business.store.createdAt,
        updatedAt: data.user.business.store.updateAt
      },
      tokens: {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken
      }
    }
  }
}
