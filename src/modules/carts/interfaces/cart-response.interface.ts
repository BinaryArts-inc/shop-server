export interface ICartResponse {
  id: string
  product: IdName & { price: number; discountPrice: number; images: string[] }
  quantity: number
  subTotal: number
  createdAt: string
}
