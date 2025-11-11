export interface BuyerProfile {
  profile: {
    fullName: string
    email: string
    phoneNumber: string
    dateJoined: Date
    status: string
    lastActivity?: Date | null
    totalOrders: number
  }
  orders: {
    id: string
    dateOrdered: Date
    vendorName: string
    totalAmount: number
    status: string
  }[]
}
