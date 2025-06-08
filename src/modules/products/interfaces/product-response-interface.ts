import { ProductStatusEnum } from "../entities/product.entity"

export interface IProductResponse {
  id: string
  name: string
  category: string
  description: string
  price: number
  discountPrice: number
  stockCount: number
  images: string[]
  status: ProductStatusEnum
  store: {
    id: string
    name: string
    category: string
    logo: string
    description: string
    createdAt: Date
    updatedAt: Date
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    fullName: () => void
    role: string
    createdAt: Date
    updatedAt: Date
  }
  createdAt: Date
  updateAt: Date
}
