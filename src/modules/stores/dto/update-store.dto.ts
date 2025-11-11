import { PartialType } from "@nestjs/mapped-types"
import { CreateStoreDto } from "./create-store.dto"
import * as Joi from "joi"

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export const updateStoreSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  categories: Joi.string()
    .valid("clothings", "gadgets", "groceries", "women", "bodyCreamAndOil", "furniture", "tvAndHomeAppliances", "watchesAndAccessories")
    .optional(),
  type: Joi.string().valid("premium", "skishop", "basic").default("basic")
})
