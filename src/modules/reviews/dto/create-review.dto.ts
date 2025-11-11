import { Product } from "@/modules/products/entities/product.entity"
import { User } from "@/modules/users/entity/user.entity"
import * as joi from "joi"

export class CreateReviewDto {
  reviewerId: string
  productId: string
  comment: string
  rating: number
  product: Product
  reviewer: User
}

export const CreateReviewSchema = joi.object({
  productId: joi.string().uuid().required(),
  comment: joi.string().min(1).max(500).required(),
  rating: joi.number().min(0).max(5).required()
})
