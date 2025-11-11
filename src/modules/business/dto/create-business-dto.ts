import { User } from "@/modules/users/entity/user.entity"
import * as joi from "joi"
import { KYC_ENUM_STATUS } from "../enum/kyc-status-enum"

export class CreateBusinessDto {
  type: string
  businessRegNumber?: string
  contactNumber: string
  address: string
  country: string
  state: string
  kycVerificationType: string
  identificationNumber: string
  user: User
  kycStatus?: KYC_ENUM_STATUS
}

export const createBusinessSchema = joi.object({
  type: joi.string().required(),
  businessRegNumber: joi.string().optional().allow(null, ""),
  contactNumber: joi.string().required(),
  address: joi.string().required(),
  country: joi.string().required(),
  state: joi.string().required(),
  kycVerificationType: joi.string().required(),
  identificationNumber: joi.string().required()
})
