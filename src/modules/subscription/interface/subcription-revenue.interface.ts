export interface SubscriptionRevenueInterface {
  startDate: Date
  endDate: Date
  isPaid: boolean
}

export interface MonthlySubscriptionRevenue {
  year: number
  month: number
  total: number
}
