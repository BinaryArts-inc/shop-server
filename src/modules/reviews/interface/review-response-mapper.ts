import { Review } from "../entities/review.entity"
import { IReviewResponse } from "./review-response-interface"

export abstract class ReviewResponseMapper implements IInterceptor {
  transform(data: Review): IReviewResponse {
    return {
      id: data.id,
      comment: data.comment,
      rating: data.rating,
      product: {
        id: data.product?.id,
        name: data.product?.name,
        description: data.product?.description,
        images: data.product?.images
      },
      reviewer: {
        id: data.reviewer?.id,
        firstName: data.reviewer?.firstName,
        lastName: data.reviewer?.lastName,
        email: data.reviewer?.email
      },
      createdAt: data.createdAt
    }
  }
}
