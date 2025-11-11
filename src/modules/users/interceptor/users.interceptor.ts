import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { User } from "../entity/user.entity"
import { UserResponseMapper } from "../interfaces/user-mapper"
import { IUsersResponse } from "../interfaces/users-response"
import { IUserResponse } from "../interfaces/user-response"

type PayloadType = [User[], number]

@Injectable()
export class UsersInterceptor extends UserResponseMapper implements NestInterceptor<PayloadType, IUsersResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IUsersResponse> | Promise<Observable<IUsersResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([users, total]: PayloadType, params: PaginationParams): IUsersResponse {
    const data = users.map((user) => this.transform(user))
    return this.paginationService.paginate<IUserResponse>(data, total, params)
  }
}
