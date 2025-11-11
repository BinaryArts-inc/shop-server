import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { SubscriptionResponseMapper } from "../interface/subcription-mapper.interface"
import { Subscription } from "../entities/subscription.entity"
import { ISubscriptionResponse } from "../interface/subscription-response.interface"

@Injectable()
export class SubscriptionInterceptor extends SubscriptionResponseMapper implements NestInterceptor<Subscription, ISubscriptionResponse> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Subscription>
  ): Observable<ISubscriptionResponse> | Promise<Observable<ISubscriptionResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
