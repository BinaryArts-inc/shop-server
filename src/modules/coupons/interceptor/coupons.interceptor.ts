import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Coupon } from "../entities/coupon.entity"
import { CouponResponseMapper } from "../interface/coupon-response-mapper.interface"
import { ICouponsResponse } from "../interface/coupons-response.interface"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { ICouponResponse } from "../interface/coupon-response.interface"

type payload = [Coupon[], number]

@Injectable()
export class CouponsResponseInterceptor extends CouponResponseMapper implements NestInterceptor<payload, ICouponsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }
  intercept(context: ExecutionContext, next: CallHandler<payload>): Observable<ICouponsResponse> | Promise<Observable<ICouponsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([coupons, total]: payload, params: PaginationParams): ICouponsResponse {
    const data = coupons.map((coupon) => this.transform(coupon))
    return this.paginationService.paginate<ICouponResponse>(data, total, params)
  }
}
