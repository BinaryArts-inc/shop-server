import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"

import { Payout } from "../entities/payout.entity"
import { IPayoutResponse } from "../interfaces/payout-response.interface"
import { PayoutResponseMapper } from "../interfaces/payout-response-mapper"

@Injectable()
export class PayoutResponseInterceptor extends PayoutResponseMapper implements NestInterceptor<Payout, IPayoutResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Payout>): Observable<IPayoutResponse> | Promise<Observable<IPayoutResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
