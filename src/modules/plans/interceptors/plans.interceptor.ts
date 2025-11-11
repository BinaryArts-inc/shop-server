import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { PlanResponseMapper } from "../interface/plan-mapper.interface"
import { IPlanResponses } from "../interface/plan-reponses.interface"
import { Plan } from "../entities/plan.entity"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { map, Observable } from "rxjs"
import { IPlanResponse } from "../interface/plan-response.interface"

type Payload = [Plan[], number]

@Injectable()
export class PlansIntercerptor extends PlanResponseMapper implements NestInterceptor<Payload, IPlanResponses> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<Payload>): Observable<IPlanResponses> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([plans, total]: Payload, params: PaginationParams): IPlanResponses {
    const data = plans.map((plan) => this.transform(plan))
    return this.paginationService.paginate<IPlanResponse>(data, total, params)
  }
}
