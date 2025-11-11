import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Cart } from "../entities/cart.entity"
import { CartResponseMapper } from "../interfaces/cart-response-mapper"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { ICartsResponse } from "../interfaces/carts-response.interface"
import { ICartResponse } from "../interfaces/cart-response.interface"

type PayloadType = [Cart[], number]

@Injectable()
export class CartsInterceptor extends CartResponseMapper implements NestInterceptor<PayloadType, ICartsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<ICartsResponse> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([carts, total]: PayloadType, params: PaginationParams): ICartsResponse {
    const data = carts.map((cart) => this.transform(cart))
    return this.paginationService.paginate<ICartResponse>(data, total, params)
  }
}
