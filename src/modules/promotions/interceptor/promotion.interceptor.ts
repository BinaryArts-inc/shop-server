import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { PromotionResponseMapper } from "../interface/promotion-mapper.interface"
import { Promotion } from "../entities/promotion.entity"
import { IPromotionResponse } from "../interface/promotion-response.interface"

@Injectable()
export class PromotionInterceptor extends PromotionResponseMapper implements NestInterceptor<Promotion, IPromotionResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Promotion>): Observable<IPromotionResponse> | Promise<Observable<IPromotionResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
