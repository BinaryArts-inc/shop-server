import { IAuth } from "@/config/auth.config"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { UserService } from "@/modules/users/user.service"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"

@Injectable()
export default class JwtShortTimeGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)

    if (!token) throw new UnAuthorizedException()

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<IAuth>("auth").shortTimeJwtSecret
      })

      const user = await this.userService.findById(payload.id)

      if (!user) throw new UnAuthorizedException()

      request.user = user
    } catch (error) {
      throw new UnAuthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
