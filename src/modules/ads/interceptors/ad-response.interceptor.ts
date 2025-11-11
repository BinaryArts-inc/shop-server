import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"

import { Ad } from "../entities/ad.entity"
import { AdsMapper } from "../interfaces/ads-response-mapper"
import { IAdResponse } from "../interfaces/ad-response.interface"

@Injectable()
export class AdResponseInterceptor extends AdsMapper implements NestInterceptor<Ad, IAdResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Ad>): Observable<IAdResponse> | Promise<Observable<IAdResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
