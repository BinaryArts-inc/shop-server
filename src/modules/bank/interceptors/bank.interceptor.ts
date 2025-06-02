import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { BankResponseMapper } from "../interfaces/bank-response-mapper"
import { Bank } from "../entities/bank.entity"
import { IBankResponse } from "../interfaces/bank-response.interface"
import { Observable, map } from "rxjs"

@Injectable()
export class BankInterceptor extends BankResponseMapper implements NestInterceptor<Bank, IBankResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Bank>): Observable<IBankResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
