import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { User } from "@/modules/user/entity/user.entity"
import { ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { Observable } from "rxjs"
@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }
  canActivate(context: ExecutionContext): Promise<boolean> | boolean | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride("isPublic", [context.getHandler(), context.getClass()])
    const isShortTime = this.reflector.getAllAndOverride("isShortTime", [context.getHandler(), context.getClass()])
    if (isPublic || isShortTime) return true
    return super.canActivate(context)
  }

  handleRequest<T extends User>(err: any, user: T, info: any) {
    if (err || !user) {
      throw err || new UnAuthorizedException(info?.message || "Unauthorized")
    }
    return user
  }
}
