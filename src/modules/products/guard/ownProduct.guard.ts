import { Request } from "express"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

import { ProductsService } from "../products.service"
import { NotFoundException } from "@/exceptions/notfound.exception"

@Injectable()
export class OwnProductGuard implements CanActivate {
  constructor(private readonly productsService: ProductsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const productData = await this.productsService.findById(request.params.id)
    if (!productData) throw new NotFoundException("product not found")
    return !productData ? false : productData.user.id === request.user.id
  }
}
