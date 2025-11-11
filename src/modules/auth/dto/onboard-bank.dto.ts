import { User } from "@/modules/users/entity/user.entity"
import * as joi from "joi"

export class OnboardBankDto {
  bankName: string
  accountNumber: string
  accountName: string
  code: string
  recipientCode: string
  user: User
}

export const onboardBankSchema = joi.object({
  bankName: joi.string().required(),
  accountNumber: joi.string().required(),
  accountName: joi.string().required(),
  code: joi.string().required()
})
