import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { CartResponseMapper } from "../interfaces/cart-response-mapper"
import { Cart } from "../entities/cart.entity"
import { ICartResponse } from "../interfaces/cart-response.interface"
import { Observable, map } from "rxjs"

@Injectable()
export class CartInterceptor extends CartResponseMapper implements NestInterceptor<Cart, ICartResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Cart>): Observable<ICartResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
