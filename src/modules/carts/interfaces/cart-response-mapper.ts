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
      vendor: {
        id: data.product?.store?.business?.user.id,
        name: data.product?.store?.business?.user.getFullName()
      },
      quantity: data.quantity,
      subTotal: data.quantity * (data.product.discountPrice || data.product.price),
      createdAt: data.createdAt.toISOString()
    }
  }
}
