import * as joi from "joi"

export class CreateBankDto {
  bankName: string
  accountNumber: string
  accountName: string
}

export const bankSchema = joi.object({
  bankName: joi.string().required(),
  accountNumber: joi.string().required(),
  accountName: joi.string().required()
})
