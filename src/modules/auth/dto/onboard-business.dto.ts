import * as joi from "joi"

export class OnboardBusinessDto {
  type: string
  businessRegNumber?: string
  contactNumber: string
  address: string
  country: string
  state: string
  kycVerificationType: string
  identificationNumber: string
}

export const onboardBusinessSchema = joi.object({
  type: joi.string().required(),
  businessRegNumber: joi.string().optional().allow(null, ""),
  contactNumber: joi.string().required(),
  address: joi.string().required(),
  country: joi.string().required(),
  state: joi.string().required(),
  kycVerificationType: joi.string().required(),
  identificationNumber: joi.string().required()
})
