import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { OrderResponseMapper } from "../interfaces/order-response-mapper"
import { Order } from "../entities/order.entity"
import { IOrdersResponse } from "../interfaces/orders-response.interface"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { IOrderResponse } from "../interfaces/order-response.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { Request } from "express"
import { UserRoleEnum } from "@/modules/users/entity/user.entity"
import { OrderItemService } from "../orderItem.service"

type PayloadType = [Order[], number]

@Injectable()
export class OrdersInterceptor extends OrderResponseMapper implements NestInterceptor<PayloadType, IOrdersResponse> {
  constructor(
    private paginationService: PaginationService,
    private readonly orderItemService: OrderItemService
  ) {
    super()
  }

  async intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Promise<Observable<IOrdersResponse>> {
    const request = context.switchToHttp().getRequest<Request>()
    const { page, limit } = request.query
    const user = request.user
    const metadata: Record<string, any> = {}

    if (user.role === UserRoleEnum.Vendor) {
      metadata.totalSales = await this.orderItemService.totalSales(user.id)
    }

    return next.handle().pipe(map((data) => this.paginate(data, { page: Number(page), limit: Number(limit) }, metadata)))
  }

  paginate([orders, total]: PayloadType, params: PaginationParams, metadata?: Record<string, any>): IOrdersResponse {
    const data = orders.map((order) => this.transform(order))
    return this.paginationService.paginate<IOrderResponse>(data, total, params, metadata)
  }
}
