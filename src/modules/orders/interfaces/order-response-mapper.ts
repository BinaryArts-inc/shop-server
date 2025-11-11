import { Order } from "../entities/order.entity"
import { IOrderResponse } from "./order-response.interface"

export abstract class OrderResponseMapper implements IInterceptor {
  transform(data: Order): IOrderResponse {
    return {
      id: data.id,
      status: data.status,
      paidAt: data.paidAt,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      deliveryStatus: data.deliveryStatus,
      totalAmount: data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      buyer: {
        id: data.buyer.id,
        name: data.buyer.getFullName(),
        phoneNumber: data.buyer.phoneNumber,
        address: data.buyer.address
      },
      products: data.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        images: item.product.images,
        price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        quantity: item.quantity,
        vendor: { id: item.product.user.id, name: item.product.user.getFullName() }
      })),
      createdAt: data.paidAt?.toISOString() ?? data.createdAt.toISOString()
    }
  }
}
