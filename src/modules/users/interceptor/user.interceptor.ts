import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { UserResponseMapper } from "../interfaces/user-mapper"
import { User } from "../entity/user.entity"
import { IUserResponse } from "../interfaces/user-response"

@Injectable()
export class UserInterceptor extends UserResponseMapper implements NestInterceptor<User, IUserResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<User>): Observable<IUserResponse> | Promise<Observable<IUserResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
