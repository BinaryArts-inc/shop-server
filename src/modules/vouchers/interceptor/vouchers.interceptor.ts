import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Voucher } from "../entities/voucher.entity"
import { VoucherResponseMapper } from "../interface/voucher-response-mapper"
import { IVouchersResponse } from "../interface/vouchers-response.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { IVoucherResponse } from "../interface/voucher-response.interface"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

type PayloadType = [Voucher[], number]

@Injectable()
export class VouchersInterceptor extends VoucherResponseMapper implements NestInterceptor<PayloadType, IVouchersResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IVouchersResponse> | Promise<Observable<IVouchersResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([vouchers, total]: PayloadType, params: PaginationParams): IVouchersResponse {
    const data = vouchers.map((voucher) => this.transform(voucher))
    return this.paginationService.paginate<IVoucherResponse>(data, total, params)
  }
}
