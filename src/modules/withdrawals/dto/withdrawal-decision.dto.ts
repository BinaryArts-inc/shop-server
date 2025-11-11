import * as Joi from "joi"

export class WithdrawalDecision {
  withdrawalId: string
  decision: "approve" | "reject"
}

export const withdrawalDecisionSchema = Joi.object({
  withdrawalId: Joi.string().uuid().required(),
  decision: Joi.string().valid("approve", "reject").required()
})
