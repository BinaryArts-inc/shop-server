import { Module } from "@nestjs/common"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Product } from "./entities/product.entity"
import { StoreModule } from "../store/store.module"
import { DtoMapper } from "./interfaces/update-product-mapper.interface"

@Module({
  imports: [TypeOrmModule.forFeature([Product]), StoreModule],
  controllers: [ProductsController],
  providers: [ProductsService, DtoMapper]
})
export class ProductsModule {}
