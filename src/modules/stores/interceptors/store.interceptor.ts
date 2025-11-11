import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { StoreResponseMapper } from "../interface/store.response.mapper"
import { Store } from "../entities/store.entity"
import { StoreResponse } from "../interface/store.response.interface"
import { map, Observable } from "rxjs"

@Injectable()
export class StoreInterceptor extends StoreResponseMapper implements NestInterceptor<Store, StoreResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Store>): Observable<StoreResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
