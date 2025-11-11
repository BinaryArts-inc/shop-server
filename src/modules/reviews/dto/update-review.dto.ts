import { PartialType } from "@nestjs/mapped-types"
import { CreateReviewDto } from "./create-review.dto"
import * as joi from "joi"

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export const UpdateReviewSchema = joi.object({
  reviewerId: joi.string().uuid().optional(),
  productId: joi.string().uuid().optional(),
  comment: joi.string().min(1).max(500).optional(),
  rating: joi.number().min(0).max(5).optional()
})
