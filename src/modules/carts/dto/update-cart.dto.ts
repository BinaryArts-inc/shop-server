import { PartialType } from "@nestjs/mapped-types"
import { CreateCartDto } from "./create-cart.dto"
import * as joi from "joi"

export class UpdateCartDto extends PartialType(CreateCartDto) {}

export const updateCartSchema = joi.object({
  quantity: joi.number().required().min(1)
})
