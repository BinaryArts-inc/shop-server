export interface ICartResponse {
  id: string
  product: IdName & { price: number; discountPrice: number; images: string[] }
  quantity: number
  vendor: IdName
  subTotal: number
  createdAt: string
}
