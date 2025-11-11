import * as joi from "joi"
import { PlanInterval } from "../interface/plan-interval.interface"
import { PLAN_INTERVAL } from "../enums/plan-interval.enum"

export class CreatePlanDto {
  amount: number
  name: string
  interval: PlanInterval
  planCode: string
  savingPercentage?: number
}

export const createPlanSchema = joi.object({
  amount: joi.number().required(),
  name: joi.string().required(),
  interval: joi
    .number()
    .valid(...PLAN_INTERVAL)
    .required(),
  savingPercentage: joi.number().optional()
})
