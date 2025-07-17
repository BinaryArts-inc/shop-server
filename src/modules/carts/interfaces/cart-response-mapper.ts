import { Cart } from "../entities/cart.entity"
import { ICartResponse } from "./cart-response.interface"

export abstract class CartResponseMapper implements IInterceptor {
  transform(data: Cart): ICartResponse {
    return {
      id: data.id,
      product: {
        id: data.product.id,
        price: data.product.price,
        discountPrice: data.product.discountPrice,
        name: data.product.name,
        images: data.product.images
      },
      quantity: data.quantity,
      subTotal: data.quantity * (data.product.discountPrice || data.product.price),
      createdAt: data.createdAt.toISOString()
    }
  }
}
