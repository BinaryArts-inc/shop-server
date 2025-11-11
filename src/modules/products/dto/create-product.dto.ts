import { Store } from "@/modules/stores/entities/store.entity"
import * as joi from "joi"
import { User } from "@/modules/users/entity/user.entity"
import { ProductCategoriesEnum, ProductStatusEnum } from "@/modules/common/types"

export class CreateProductDto {
  name: string
  price: number
  category: ProductCategoriesEnum
  description: string
  discountPrice?: number
  stockCount: number
  totalProductRatingSum?: number
  totalProductRatingCount?: number
  status: ProductStatusEnum
  storeId: string
  userId: string
  store: Store
  user: User
  images: string[]
  slug: string
}

export const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required(),
  category: joi
    .string()
    .valid("clothings", "gadgets", "groceries", "women", "bodyCreamAndOil", "furniture", "tvAndHomeAppliances", "watchesAndAccessories")
    .required(),
  description: joi.string().required(),
  discountPrice: joi
    .number()
    .optional()
    .when("price", {
      is: joi.exist(),
      then: joi.number().max(joi.ref("price")).messages({
        "number.max": "Discount price cannot be greater than the original price"
      })
    }),
  stockCount: joi.number().required(),
  storeId: joi.string().required(),
  status: joi.string().valid("draft", "published").optional()
})
