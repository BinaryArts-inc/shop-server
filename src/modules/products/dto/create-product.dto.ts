import User from "@/modules/user/entity/user.entity"
import { ProductStatusEnum } from "../entities/product.entity"
import * as joi from "joi"
import { Store } from "@/modules/store/entities/store.entity"
export class CreateProductDto {
  name: string
  price: number
  category: string
  description: string
  discountPrice?: number
  stockCount: number
  status: ProductStatusEnum
  storeId: string
  images: string[]
  user?: User
  store?: Store
}

export const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required(),
  category: joi.string().required(),
  description: joi.string().required(),
  discountPrice: joi.number().optional(),
  stockCount: joi.number().required(),
  storeId: joi.string().required(),
  status: joi.string().valid("draft", "published").optional()
})
