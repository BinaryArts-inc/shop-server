import * as joi from "joi"

export class UpdateProfileDto {
  user: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
  }
  store: {
    name?: string
    logo?: string
    description?: string
  }
  business: {
    type?: string
    businessRegNumber?: string
    name?: string
    country?: string
    state?: string
    address?: string
  }
}

export const updateProfileSchema = joi.object({
  user: joi
    .object({
      firstName: joi.string().optional(),
      lastName: joi.string().optional(),
      phoneNumber: joi.string().optional()
    })
    .optional(),
  store: joi
    .object({
      name: joi.string().optional(),
      description: joi.string().optional()
    })
    .optional(),
  business: joi
    .object({
      type: joi.string().optional(),
      businessRegNumber: joi.string().optional(),
      name: joi.string().optional(),
      country: joi.string().optional(),
      state: joi.string().optional(),
      address: joi.string().optional()
    })
    .optional()
})
