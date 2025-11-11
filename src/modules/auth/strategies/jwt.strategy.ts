import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { Request } from "express"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { UserService } from "@/modules/users/user.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<IAuth>("auth").jwtSecret
    })
  }

  async validate(payload: any, req: Request) {
    const user = await this.userService.findById(payload.id)

    if (!user) {
      throw new UnAuthorizedException()
    }

    req.user = user
    return user
  }
}
