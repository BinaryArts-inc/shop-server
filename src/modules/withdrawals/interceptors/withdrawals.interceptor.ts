import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"

import { Withdrawal } from "../entities/withdrawal.entity"
import { WithdrawalResponseMapper } from "../interfaces/withdrawal-response-mapper"
import { IWithdrawalsResponse } from "../interfaces/withdrawals-response.interface"

type PayloadType = [Withdrawal[], number]

@Injectable()
export class WithdrawalsResponseInterceptor extends WithdrawalResponseMapper implements NestInterceptor<PayloadType, IWithdrawalsResponse> {
  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IWithdrawalsResponse> | Promise<Observable<IWithdrawalsResponse>> {
    return next.handle().pipe(map(([data]) => data.map((d) => this.transform(d))))
  }
}
