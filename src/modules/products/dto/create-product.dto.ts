import { Store } from "@/modules/store/entities/store.entity"
import { ProductStatusEnum } from "../entities/product.entity"
import * as joi from "joi"
import User from "@/modules/user/entity/user.entity"

export class CreateProductDto {
  name: string
  price: number
  category: string
  description: string
  discountPrice?: number
  stockCount: number
  status: ProductStatusEnum
  storeId: string
  userId: string
  store: Store
  user: User
  images: string[]
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
