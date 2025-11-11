import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Store } from "../entities/store.entity"
import { StoreResponseMapper } from "../interface/store.response.mapper"
import { StoreResponse } from "../interface/store.response.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { StoresResponse } from "../interface/stores.response.interface"

type PayloadType = [Store[], number]
@Injectable()
export class StoresInterceptor extends StoreResponseMapper implements NestInterceptor<PayloadType, StoresResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }
  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<StoresResponse> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([store, total]: PayloadType, params: PaginationParams): StoresResponse {
    const data = store.map((store) => this.transform(store))
    return this.paginationService.paginate<StoreResponse>(data, total, params)
  }
}
