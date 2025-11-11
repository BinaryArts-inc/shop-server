import { Voucher } from "../entities/voucher.entity"
import { IVoucherResponse } from "./voucher-response.interface"

export abstract class VoucherResponseMapper implements IInterceptor {
  transform(data: Voucher): IVoucherResponse {
    return {
      id: data.id,
      userId: data.userId,
      code: data.code,
      prizeType: data.prizeType,
      prizeWon: data.prizeWon,
      dateWon: data.dateWon,
      endDate: data.endDate,
      startDate: data.startDate,
      status: data.status
    }
  }
}
