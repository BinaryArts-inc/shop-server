import { Injectable } from "@nestjs/common"
import { UpdateProductDto } from "../dto/update-product.dto"
import { Product } from "../entities/product.entity"

@Injectable()
export class DtoMapper {
  prepareUpdateProductDto(dto: UpdateProductDto, product: Product, images: string[]): UpdateProductDto {
    return {
      category: dto.category ?? product.category,
      description: dto.description ?? product.description,
      discountPrice: dto.discountPrice ?? product.discountPrice,
      name: dto.name ?? product.name,
      price: dto.price ?? product.price,
      status: dto.status ?? product.status,
      stockCount: dto.stockCount ?? product.stockCount,
      userId: dto.userId ?? product.userId,
      storeId: dto.storeId ?? product.storeId,
      images
    }
  }
}
