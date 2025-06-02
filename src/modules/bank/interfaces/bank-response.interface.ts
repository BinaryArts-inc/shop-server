export interface IBankResponse {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  user: {
    id: string
    role: string
    firstName: string
    lastName: string
    email: string
    createdAt: Date
    updatedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}
