import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { ReviewResponseMapper } from "../interface/review-response-mapper"
import { Review } from "../entities/review.entity"
import { IReviewResponse } from "../interface/review-response-interface"
import { map, Observable } from "rxjs"

@Injectable()
export class ReviewInterceptor extends ReviewResponseMapper implements NestInterceptor<Review, IReviewResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Review>): Observable<IReviewResponse> | Promise<Observable<IReviewResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
