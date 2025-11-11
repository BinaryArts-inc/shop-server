import { Plan } from "../entities/plan.entity"
import { IPlanResponse } from "./plan-response.interface"

export abstract class PlanResponseMapper implements IInterceptor {
  transform(data: Plan): IPlanResponse {
    return {
      id: data.id,
      name: data.name,
      planCode: data.planCode,
      savingPercentage: data.savingPercentage,
      amount: data.amount,
      createdAt: data.createdAt
    }
  }
}
