import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"

import { Order } from "../entities/order.entity"
import { IOrderResponse } from "../interfaces/order-response.interface"
import { OrderResponseMapper } from "../interfaces/order-response-mapper"

@Injectable()
export class OrderInterceptor extends OrderResponseMapper implements NestInterceptor<Order, IOrderResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Order>): Observable<IOrderResponse> | Promise<Observable<IOrderResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
