import * as joi from "joi"
import { SubscriptionEnum } from "../entities/subscription.entity"

export class CreateSubscriptionDto {
  vendorId: string
  reference?: string
  startDate: Date
  endDate: Date
  planType: string
  planCode: string
  status: SubscriptionEnum
  amount: number
  subscriptionCode: string
  isPaid: boolean
}

export const createSubcriptionSchema = joi.object({
  amount: joi.number().required(),
  planCode: joi.string().required(),
  planType: joi.string().required()
})
