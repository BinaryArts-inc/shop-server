import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import Business from "../entities/business.entity"
import { BusinessResponseMapper } from "../interface/business-mapper.interface"
import { IBusinessesResponse } from "../interface/businesses-response.interface"
import { IBusinessResponse } from "../interface/business-response.interface"

type PayloadType = [Business[], number]

@Injectable()
export class BusinessesInterceptor extends BusinessResponseMapper implements NestInterceptor<PayloadType, IBusinessesResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IBusinessesResponse> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([businesses, total]: PayloadType, params: PaginationParams): IBusinessesResponse {
    const data = businesses.map((business) => this.transform(business))
    return this.paginationService.paginate<IBusinessResponse>(data, total, params)
  }
}
