import { BadReqException } from "@/exceptions/badRequest.exception"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { User } from "@/modules/users/entity/user.entity"
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { TokenError } from "passport-oauth2"

@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
  constructor() {
    super({
      accessType: "offline"
    })
  }

  handleRequest<TUser extends User>(err: any, user: TUser): TUser {
    console.error("error debugging>>>>", err, user)

    if (!user) {
      throw new BadReqException("user not found")
    }

    if (err) {
      // Handle specific OAuth2 errors
      if (err instanceof TokenError) {
        throw new BadReqException("Invalid authorization code")
      }

      // Handle other errors
      throw new UnAuthorizedException("Authentication failed")
    }

    return user
  }
}
