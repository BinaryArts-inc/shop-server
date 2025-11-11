import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Bank } from "../entities/bank.entity"
import { BankResponseMapper } from "../interfaces/bank-response-mapper"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { IBanksResponse } from "../interfaces/banks-response.interface"
import { IBankResponse } from "../interfaces/bank-response.interface"

type PayloadType = [Bank[], number]

@Injectable()
export class BanksInterceptor extends BankResponseMapper implements NestInterceptor<PayloadType, IBanksResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IBanksResponse> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([banks, total]: PayloadType, params: PaginationParams): IBanksResponse {
    const data = banks.map((bank) => this.transform(bank))
    return this.paginationService.paginate<IBankResponse>(data, total, params)
  }
}
