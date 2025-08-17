import { ProductCategoriesEnum, ProductStatusEnum } from "@/modules/common/types"

export interface IProductResponse {
  id: string
  name: string
  category: ProductCategoriesEnum
  description: string
  price: number
  rating: number
  discountPrice: number
  savedProduct: SavedProduct[]
  stockCount: number
  images: string[]
  status: ProductStatusEnum
  store: IdName
  user: IdName
  createdAt: Date
  updateAt: Date
}

type SavedProduct = {
  id: string
  isLiked: boolean
}
