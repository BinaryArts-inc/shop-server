import { Product } from "../entities/product.entity"
import { IProductResponse } from "./product-response-interface"

export abstract class ProductResponseMapper implements IInterceptor {
  transform(data: Product): IProductResponse {
    return {
      id: data.id,
      name: data.name,
      status: data.status,
      category: data.category,
      description: data.description,
      discountPrice: data.discountPrice,
      images: data.images,
      price: data.price,
      stockCount: data.stockCount,
      store: {
        id: data.store.id,
        category: data.store.category,
        description: data.store.description,
        logo: data.store.logo,
        name: data.store.name,
        createdAt: data.store.createdAt,
        updatedAt: data.store.updateAt
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        fullName: data.user.fullName,
        role: data.user.role,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      },
      createdAt: data.createdAt,
      updateAt: data.updatedAt
    }
  }
}
