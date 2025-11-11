import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { AuthUserBusiness, IAuthResponse } from "../interface/auth-response"
import { Observable, map } from "rxjs"
import { AuthResponseMapper } from "./auth-response-mapper"

@Injectable()
export class AuthInterceptor extends AuthResponseMapper implements NestInterceptor<AuthUserBusiness, IAuthResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<AuthUserBusiness>): Observable<IAuthResponse> {
    return next.handle().pipe(
      map((data) => {
        return this.transform(data)
      })
    )
  }
}
