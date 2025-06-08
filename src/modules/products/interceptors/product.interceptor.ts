import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { ProductResponseMapper } from "../interfaces/product-response-mapper"
import { Product } from "../entities/product.entity"
import { IProductResponse } from "../interfaces/product-response-interface"
import { Observable, map } from "rxjs"

@Injectable()
export class ProductInterceptor extends ProductResponseMapper implements NestInterceptor<Product, IProductResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Product>): Observable<IProductResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
