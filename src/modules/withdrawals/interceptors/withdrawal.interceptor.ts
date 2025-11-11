import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"

import { Withdrawal } from "../entities/withdrawal.entity"
import { IWithdrawalResponse } from "../interfaces/withdrawal-response.interface"
import { WithdrawalResponseMapper } from "../interfaces/withdrawal-response-mapper"

export class WithdrawalResponseInterceptor extends WithdrawalResponseMapper implements NestInterceptor<Withdrawal, IWithdrawalResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Withdrawal>): Observable<IWithdrawalResponse> | Promise<Observable<IWithdrawalResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
