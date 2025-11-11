import { Withdrawal } from "../entities/withdrawal.entity"
import { IWithdrawalResponse } from "./withdrawal-response.interface"

export abstract class WithdrawalResponseMapper implements IInterceptor {
  public transform(data: Withdrawal): IWithdrawalResponse {
    return {
      id: data.id,
      amount: data.amount,
      date: data.createdAt.toISOString(),
      status: data.status,
      walletBalance: data.currentWalletBalance,
      bank: {
        id: data.bank.id,
        name: data.bank.bankName,
        firstThreeDigits: data.bank.accountNumber.substring(0, 3),
        lastThreeDigits: data.bank.accountNumber.substring(data.bank.accountNumber.length - 3, data.bank.accountNumber.length)
      },
      store: {
        name: data.bank.user.business.store.name
      },
      user: {
        role: data.bank.user.role
      },
      processedBy: data?.processedBy?.getFullName(),
      dateProccess: data?.dateApproved
    }
  }
}
