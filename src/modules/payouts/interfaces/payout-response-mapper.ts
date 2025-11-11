import { Payout } from "../entities/payout.entity"
import { IPayoutResponse } from "./payout-response.interface"

export abstract class PayoutResponseMapper implements IInterceptor {
  public transform(data: Payout): IPayoutResponse {
    return {
      id: data.id,
      pending: parseFloat(data.pending.toString()),
      available: parseFloat(data.available.toString()),
      withdrawn: parseFloat(data.withdrawn.toString()),
      total: parseFloat(data.total.toString())
    }
  }
}
