import { Request } from "express"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"

import { AuthService } from "../auth.service"
import { User } from "@/modules/users/entity/user.entity"
import { Strategy } from "passport-google-oauth2"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get("auth.google.clientId"),
      clientSecret: configService.get("auth.google.clientSecret"),
      callbackURL: configService.get("auth.google.callbackUrl"),
      scope: ["profile", "email"],
      passReqToCallback: true
    })
  }

  async validate(req: Request, _accessToken: string, _refreshToken: string, profile: any): Promise<User> {
    console.error("profile: ", profile)

    const user = await this.authService.validateEmail(profile.email)

    req.user = user

    return user
  }
}
