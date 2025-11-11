export interface MonthlySalesData {
  year: number
  month: string
  total: number
}

export interface MonthlySalesQuery {
  startDate: Date
  endDate: Date
  status: string
}
