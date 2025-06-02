import { IAuth } from "@/config/auth.config"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"

@Injectable()
export default class JwtShortTimeGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) throw new UnAuthorizedException()

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<IAuth>("auth").shortTimeJwtSecret
      })

      request["payload"] = payload
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
