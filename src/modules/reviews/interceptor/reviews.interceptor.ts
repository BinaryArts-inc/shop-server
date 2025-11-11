import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { ReviewResponseMapper } from "../interface/review-response-mapper"
import { Review } from "../entities/review.entity"
import { IReviewsResponse } from "../interface/reviews-response-interface"
import { map, Observable } from "rxjs"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { IReviewResponse } from "../interface/review-response-interface"
import { PaginatedResult } from "@/modules/services/pagination/interfaces/pagination-result.interface"

type PayloadType = [Review[], number]

@Injectable()
export class ReviewsInterceptor extends ReviewResponseMapper implements NestInterceptor<PayloadType, IReviewsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IReviewsResponse> | Promise<Observable<IReviewsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([reviews, total]: PayloadType, params: PaginationParams): PaginatedResult<IReviewResponse> {
    const data = reviews.map((review) => this.transform(review))
    return this.paginationService.paginate<IReviewResponse>(data, total, params)
  }
}
