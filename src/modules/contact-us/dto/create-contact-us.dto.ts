import * as joi from "joi"

export class CreateContactUsDto {
  fullName: string
  email: string
  subject: string
  message: string
}

export const createContactUsSchema = joi.object({
  fullName: joi.string().required(),
  email: joi.string().email().required(),
  subject: joi.string().required(),
  message: joi.string().min(1).max(6000).required().messages({
    "string.empty": "Message cannot be empty",
    "string.min": "Message must be at least 1 character long",
    "string.max": "Message cannot exceed 6000 characters"
  })
})
