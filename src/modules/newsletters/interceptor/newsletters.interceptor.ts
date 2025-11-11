import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Newsletter } from "../entities/newsletter.entity"
import { NewsletterResponseMapper } from "../interface/newsletter-response-mapper"
import { INewsLettersResponse } from "../interface/newsletters-response.interface"
import { map, Observable } from "rxjs"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { INewsletterResponse } from "../interface/newsletter-response.interface"

type Payload = [Newsletter[], number]

@Injectable()
export class NewslettersResponseInterceptor extends NewsletterResponseMapper implements NestInterceptor<Payload, INewsLettersResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<Payload>): Observable<INewsLettersResponse> | Promise<Observable<INewsLettersResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([payouts, total]: Payload, params: PaginationParams): INewsLettersResponse {
    const data = payouts.map((payout) => this.transform(payout))
    return this.paginationService.paginate<INewsletterResponse>(data, total, params)
  }
}
