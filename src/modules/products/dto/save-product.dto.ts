import * as joi from "joi"

export class SaveProductDto {
  productId: string
  isLiked: boolean
}

export const saveProductSchema = joi.object({
  productId: joi.string().required(),
  isLiked: joi.boolean().optional().default(false)
})
