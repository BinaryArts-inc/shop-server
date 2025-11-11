export interface IReviewResponse {
  id: string
  comment: string
  rating: number
  product: {
    id: string
    images: string[]
    description: string
    name: string
  }
  createdAt: Date
  reviewer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}
