import { PartialType } from "@nestjs/mapped-types"
import { CreatePlanDto } from "./create-plan.dto"
import * as joi from "joi"

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}

export const updatePlanSchema = joi.object({
  amount: joi.number().optional(),
  name: joi.string().optional(),
  interval: joi.string().optional(),
  savingPercentage: joi.string().optional()
})
