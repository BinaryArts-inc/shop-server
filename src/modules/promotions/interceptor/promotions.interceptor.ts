import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { Promotion } from "../entities/promotion.entity"
import { PromotionResponseMapper } from "../interface/promotion-mapper.interface"
import { IPromotionsResponse } from "../interface/promotions-response.interface"
import { IPromotionResponse } from "../interface/promotion-response.interface"

type PayloadType = [Promotion[], number]

@Injectable()
export class PromotionsInterceptor extends PromotionResponseMapper implements NestInterceptor<PayloadType, IPromotionsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IPromotionsResponse> | Promise<Observable<IPromotionsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([promotions, total]: PayloadType, params: PaginationParams): IPromotionsResponse {
    const data = promotions.map((promotion) => this.transform(promotion))
    return this.paginationService.paginate<IPromotionResponse>(data, total, params)
  }
}
