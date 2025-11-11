import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable, map } from "rxjs"
import { BusinessResponseMapper } from "../interface/business-mapper.interface"
import Business from "../entities/business.entity"
import { IBusinessResponse } from "../interface/business-response.interface"

@Injectable()
export class BusinessInterceptor extends BusinessResponseMapper implements NestInterceptor<Business, IBusinessResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<Business>): Observable<IBusinessResponse> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
