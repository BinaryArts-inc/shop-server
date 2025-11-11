import { PartialType } from "@nestjs/mapped-types"
import { CreateBankDto } from "./create-bank.dto"
import * as joi from "joi"

export class UpdateBankDto extends PartialType(CreateBankDto) {}

export const updatebankSchema = joi.object({
  bankName: joi.string().optional(),
  accountNumber: joi.string().optional(),
  accountName: joi.string().optional(),
  code: joi.string().optional()
})
