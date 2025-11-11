import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable, map } from "rxjs"
import { PlanResponseMapper } from "../interface/plan-mapper.interface"
import { Plan } from "../entities/plan.entity"
import { IPlanResponse } from "../interface/plan-response.interface"

@Injectable()
export class PlanInterceptor extends PlanResponseMapper implements NestInterceptor<Plan, IPlanResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Plan>): Observable<IPlanResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
