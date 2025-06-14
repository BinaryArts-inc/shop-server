export interface IBankResponse {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  user: {
    id: string
    fullName: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}
