export interface VendorProfile {
  profile: {
    storeName: string
    email: string
    phone: string
    kycStatus: string
    subscription: string
    dateJoin: Date
  }
  business: {
    name: string
    cacRegNo: string
    kycType: string
    identificationNumber: string
  }
  subscription: {
    status: string
    planType: string
    paymentStatus: string
    startDate: Date | null
    endDate: Date | null
  }
  product: {
    totalProduct: number
    totalPublishedProduct: number
    totalOrder: number
    totalSales: number
    averageOrderValue: number
  }
  payout: {
    walletBalance: number
    totalWithdrawal: number
    pendingWithdrawal: number
    lastPayout: Date | null
  }
  order:
    | {
        id: string
        status: string
        buyerName: string
        totalAmount: number
        dateOrdered: Date | null
      }[]
    | []
}
