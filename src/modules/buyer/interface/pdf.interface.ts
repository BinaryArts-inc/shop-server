export interface PdfInterface {
  profile: {
    storeName: string
    email: string
    phoneNumber: string
    kycStatus: string
    subscriptionStatus: string
    dateJoined: Date
    orders: number
    lastActivity?: Date
  }
  business: {
    businessName: string
    CacRegNo: string
    kycType: string
    kycIdentificationNumber: string
  }
  subscription: {
    status: string
    planType: string
    paymentStatus: string
    startDate: Date
    endDate: Date
  }
  product: {
    totalProduct: number
    totalPublishedProduct: number
    totalSales: number
    averageNumberOfOrder: number
    totalOrders: number
    lastOrder?: Date
  }
  payout: {
    walletBalance: number
    totalWithdrawal: number
    pendingWithdrawal: number
    lastPayout: Date
  }
  orders: {
    id: string
    dateOrdered: Date
    buyerName: string
    totalAmount: number
    status: string
  }[]
}

export interface pdfBuyerInterface {
  profile: {
    fullName: string
    email: string
    phoneNumber: string
    dateJoined: Date
    status: string
    lastActivity?: Date | null
  }
  orders: {
    id: string
    dateOrdered: Date
    vendorName: string
    totalAmount: number
    status: string
  }[]
}
