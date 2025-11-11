import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { PayoutResponseMapper } from "../interfaces/payout-response-mapper"
import { Payout } from "../entities/payout.entity"
import { IPayoutsResponse } from "../interfaces/payouts-response.interface"
import { IPayoutResponse } from "../interfaces/payout-response.interface"

type PayloadType = [Payout[], number]

@Injectable()
export class PayoutsResponseInterceptor extends PayoutResponseMapper implements NestInterceptor<PayloadType, IPayoutsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IPayoutsResponse> | Promise<Observable<IPayoutsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([payouts, total]: PayloadType, params: PaginationParams): IPayoutsResponse {
    const data = payouts.map((payout) => this.transform(payout))
    return this.paginationService.paginate<IPayoutResponse>(data, total, params)
  }
}
