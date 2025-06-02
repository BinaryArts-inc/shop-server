import { Strategy } from "passport-local"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthService } from "../auth.service"
import { Request } from "express"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(email: string, password: string, req: Request): Promise<any> {
    console.log("here in local stragegy")
    const user = await this.authService.validateUser({ email: email, password: password })
    if (!user) {
      throw new UnauthorizedException()
    }
    req.user = user
    return user
  }
}
