import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { VoucherResponseMapper } from "../interface/voucher-response-mapper"
import { Voucher } from "../entities/voucher.entity"
import { IVoucherResponse } from "../interface/voucher-response.interface"
import { map, Observable } from "rxjs"

@Injectable()
export class VoucherInterceptor extends VoucherResponseMapper implements NestInterceptor<Voucher, IVoucherResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Voucher>): Observable<IVoucherResponse> | Promise<Observable<IVoucherResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
