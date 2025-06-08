import * as Joi from "joi"

export class OnboardStoreDto {
  name: string
  description: string
  logo: string
  category: string
}

export const onboardStoreSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required()
})
