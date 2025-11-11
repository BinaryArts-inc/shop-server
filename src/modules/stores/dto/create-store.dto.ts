import * as Joi from "joi"
import { vendonEnumType } from "../entities/store.entity"
import Business from "@/modules/business/entities/business.entity"

export class CreateStoreDto {
  name: string
  description: string
  logo: string
  type: vendonEnumType
  business: Business
  isStarSeller?: boolean
  numberOfSales?: number
  totalStoreRatingSum?: number
  totalStoreRatingCount?: number
}

export const createStoreSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid("premium", "skishop", "basic").default("basic")
})
