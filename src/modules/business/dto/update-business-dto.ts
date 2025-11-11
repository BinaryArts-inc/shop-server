import { PartialType } from "@nestjs/mapped-types"
import { CreateBusinessDto } from "./create-business-dto"
import * as joi from "joi"

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}

export const updateBusinessSchema = joi.object({
  type: joi.string().optional(),
  businessRegNumber: joi.string().optional().allow(null, ""),
  contactNumber: joi.string().optional(),
  address: joi.string().optional(),
  country: joi.string().optional(),
  state: joi.string().optional(),
  kycVerificationType: joi.string().optional(),
  identificationNumber: joi.string().optional(),
  kycStatus: joi.string().valid("pending", "verified").optional()
})
