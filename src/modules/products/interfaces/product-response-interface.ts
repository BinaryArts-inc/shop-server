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
  store: IdName
  user: IdName
  createdAt: Date
  updateAt: Date
}
