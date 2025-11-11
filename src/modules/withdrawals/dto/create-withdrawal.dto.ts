import * as Joi from "joi"
import { Payout } from "@/modules/payouts/entities/payout.entity"
import { Bank } from "@/modules/banks/entities/bank.entity"

export class CreateWithdrawalDto {
  amount: number
  bankId: string
  payout: Payout
  bank: Bank
  currentWalletBalance: number
}

export const createWithdrawalSchema = Joi.object({
  bankId: Joi.string().uuid().required(),
  amount: Joi.number().min(0).max(10000000).required()
})
