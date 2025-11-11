import { Strategy } from "passport-local"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthService } from "../auth.service"
import { Request } from "express"
import { User } from "@/modules/users/entity/user.entity"

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy, "password") {
  constructor(private authService: AuthService) {
    super({ usernameField: "email", passReqToCallback: true })
  }

  async validate(req: Request, email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser({ email, password })

    if (!user) {
      throw new UnauthorizedException()
    }

    req.user = user

    return user
  }
}
