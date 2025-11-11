import { ProductCategoriesEnum, ProductStatusEnum } from "@/modules/common/types"

export interface IProductResponse {
  id: string
  name: string
  category: ProductCategoriesEnum
  description: string
  price: number
  rating: number
  savedProduct: boolean
  discountPrice: number
  stockCount: number
  reviewsCount: number
  images: string[]
  status: ProductStatusEnum
  store: IdName
  user: IdName
  createdAt: Date
  updateAt: Date
}
