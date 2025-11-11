import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"

import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { Ad } from "../entities/ad.entity"
import { AdsMapper } from "../interfaces/ads-response-mapper"
import { IAdsResponse } from "../interfaces/ads-response.interface"
import { IAdResponse } from "../interfaces/ad-response.interface"

type PayloadType = [Ad[], number]

@Injectable()
export class AdsResponseInterceptor extends AdsMapper implements NestInterceptor<PayloadType, IAdsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IAdsResponse> | Promise<Observable<IAdsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([ads, total]: PayloadType, params: PaginationParams): IAdsResponse {
    const data = ads.map((ad) => this.transform(ad))
    return this.paginationService.paginate<IAdResponse>(data, total, params)
  }
}
