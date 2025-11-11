import { WITHDRAWAL_STATUS } from "../enums/withdrawal-status.enum"

export type WithdrawalStatus = (typeof WITHDRAWAL_STATUS)[number]
