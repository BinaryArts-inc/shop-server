import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { Subscription } from "../entities/subscription.entity"
import { SubscriptionResponseMapper } from "../interface/subcription-mapper.interface"
import { ISubscriptionResponses } from "../interface/subscription-responses.interface"
import { ISubscriptionResponse } from "../interface/subscription-response.interface"

type PayloadType = [Subscription[], number]

@Injectable()
export class SubscriptionsInterceptor extends SubscriptionResponseMapper implements NestInterceptor<PayloadType, ISubscriptionResponses> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<PayloadType>
  ): Observable<ISubscriptionResponses> | Promise<Observable<ISubscriptionResponses>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([subscription, total]: PayloadType, params: PaginationParams): ISubscriptionResponses {
    const data = subscription.map((sub) => this.transform(sub))
    return this.paginationService.paginate<ISubscriptionResponse>(data, total, params)
  }
}
