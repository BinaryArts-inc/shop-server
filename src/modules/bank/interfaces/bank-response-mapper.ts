import { Bank } from "../entities/bank.entity"
import { IBankResponse } from "./bank-response.interface"

export abstract class BankResponseMapper implements IInterceptor {
  transform(bank: Bank): IBankResponse {
    return {
      id: bank.id,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      bankName: bank.bankName,
      user: {
        id: bank.user.id,
        email: bank.user.email,
        firstName: bank.user.firstName,
        lastName: bank.user.lastName,
        role: bank.user.role,
        createdAt: bank.user.createdAt,
        updatedAt: bank.user.updatedAt
      },
      createdAt: bank.createdAt,
      updatedAt: bank.updatedAt
    }
  }
}
