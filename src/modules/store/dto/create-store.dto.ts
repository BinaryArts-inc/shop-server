import * as Joi from "joi"

export class CreateStoreDto {
  name: string
  description: string
  logo: string
  category: string
}

export const storeSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required()
})
