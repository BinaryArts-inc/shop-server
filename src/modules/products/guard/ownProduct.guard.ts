import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { ProductsService } from "../products.service"

@Injectable()
export class OwnProductGuard implements CanActivate {
  constructor(private readonly productsService: ProductsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const productId = request.params.product

    const productData = await this.productsService.findOne({ id: productId })
    if (!productData) {
      return false
    }
    if (productData.user.id !== user.id) {
      return false
    }
    return true
  }
}
