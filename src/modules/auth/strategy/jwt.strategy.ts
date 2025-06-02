import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { UserService } from "@/modules/user/user.service"
import { Request } from "express"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private UserService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<IAuth>("auth").jwtSecret
    })
  }

  async validate(payload: any, req: Request) {
    console.log("here in jwtstrategy")
    const user = await this.UserService.findById(payload.sub)

    if (!user) {
      throw new UnAuthorizedException()
    }

    req.user = user

    return user
  }
}
