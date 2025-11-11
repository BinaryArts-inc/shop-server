export interface AdRevenueInterface {
  startDate?: Date
  endDate?: Date
  status?: string[]
}

export interface MonthlyAdRevenue {
  year: number
  month: number
  total: number
}
