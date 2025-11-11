import { CommisionEnum } from "../enum/commision-enum"

export interface CommisionRevenueInterface {
  startDate: Date
  endDate: Date
  status: CommisionEnum
}

export interface MonthlyCommisionRevenue {
  year: number
  month: number
  total: number
}
