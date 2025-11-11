import * as joi from "joi"

export class CreateCartDto {
  productId: string
  quantity: number
}

export const createCartSchema = joi.object({
  productId: joi.string().uuid().required(),
  quantity: joi.number().required().min(1)
})
