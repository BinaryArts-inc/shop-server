import { OrderDeliveryStatus } from "./delivery-status"
import { OrderStatus } from "./order-status"
import { PaymentMethod } from "./payment-method.interface"

export interface IOrderResponse {
  id: string
  products: OrderItemResponse[]
  status: OrderStatus
  deliveryStatus: OrderDeliveryStatus
  totalAmount: number
  buyer: IdName & { address: string; phoneNumber: string }
  createdAt: string
  paidAt: Date
  reference: string
  paymentMethod: PaymentMethod
}

export interface OrderItemResponse {
  id: string
  name: string
  images: string[]
  price: number
  subtotal: number
  vendor: IdName
  quantity: number
}
