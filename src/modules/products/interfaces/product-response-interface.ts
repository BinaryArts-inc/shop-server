import { ProductCategoriesEnum, ProductStatusEnum } from "@/modules/common/types"

export interface IProductResponse {
  id: string
  name: string
  category: ProductCategoriesEnum
  description: string
  price: number
  savedProduct: {
    id: string
    isLiked: boolean
  }[]
  discountPrice: number
  stockCount: number
  images: string[]
  status: ProductStatusEnum
  store: IdName
  user: IdName
  createdAt: Date
  updateAt: Date
}
