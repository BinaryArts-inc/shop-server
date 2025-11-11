import { OrderDeliveryStatus } from "../interfaces/delivery-status"
import { OrderStatus } from "../interfaces/order-status"
import { PaymentMethod } from "../interfaces/payment-method.interface"

export class CreateOrderDto {
  status?: OrderStatus
  deliveryStatus?: OrderDeliveryStatus
  paymentMethod: PaymentMethod
  paidAt?: string
  buyerId: string
  reference: string
  items: Array<{
    quantity: number
    unitPrice: number
    productId: string
    storeId: string
  }>
}
