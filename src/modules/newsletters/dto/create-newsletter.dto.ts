import * as joi from "joi"

export class CreateNewsletterDto {
  email: string
}

export const createNewsletterSchema = joi.object({
  email: joi.string().email().required()
})
