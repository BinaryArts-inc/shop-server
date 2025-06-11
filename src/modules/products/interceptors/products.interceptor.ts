import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Product } from "../entities/product.entity"
import { ProductResponseMapper } from "../interfaces/product-response-mapper"
import { IProductsResponse } from "../interfaces/products-response-interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/paginationParams.interface"
import { IProductResponse } from "../interfaces/product-response-interface"
import { BadReqException } from "@/exceptions/badRequest.exception"

type PayloadType = [Product[], number]

@Injectable()
export class ProductsInterceptor extends ProductResponseMapper implements NestInterceptor<PayloadType, IProductsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IProductsResponse> {
    const request = context.switchToHttp().getRequest()
    const { page, limit, storeId } = request.query

    if (!storeId) throw new BadReqException("store id required")

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([products, total]: PayloadType, params: PaginationParams): IProductsResponse {
    const data = products.map((product) => this.transform(product))
    return this.paginationService.paginate<IProductResponse>(data, total, params)
  }
}
