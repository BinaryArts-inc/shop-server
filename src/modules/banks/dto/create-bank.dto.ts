import { User } from "@/modules/users/entity/user.entity"
import * as joi from "joi"

export class CreateBankDto {
  bankName: string
  accountNumber: string
  accountName: string
  code: string
  user: User
  recipientCode: string
}

export const bankSchema = joi.object({
  bankName: joi.string().required(),
  accountNumber: joi.string().required(),
  accountName: joi.string().required(),
  code: joi.string().required()
})
