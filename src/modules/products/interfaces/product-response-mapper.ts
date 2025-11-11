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
      savedProduct: data.savedBy ? (data?.savedBy?.length > 0 ? true : false) : null,
      images: data.images,
      reviewsCount: data.reviews ? data.reviews.length : 0,
      rating: data?.totalProductRatingSum / data?.totalProductRatingCount || 0,
      price: data.price,
      stockCount: data.stockCount,
      store: {
        id: data.store.id,
        name: data.store.name
      },
      user: {
        id: data.user.id,
        name: data.user.getFullName()
      },
      createdAt: data.createdAt,
      updateAt: data.updatedAt
    }
  }
}
