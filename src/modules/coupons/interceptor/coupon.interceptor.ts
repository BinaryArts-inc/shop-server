import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { CouponResponseMapper } from "../interface/coupon-response-mapper.interface"
import { Coupon } from "../entities/coupon.entity"
import { ICouponResponse } from "../interface/coupon-response.interface"
import { map, Observable } from "rxjs"

@Injectable()
export class CouponInterceptor extends CouponResponseMapper implements NestInterceptor<Coupon, ICouponResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Coupon>): Observable<ICouponResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
