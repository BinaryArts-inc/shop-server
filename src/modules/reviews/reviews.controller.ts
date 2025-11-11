import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UseGuards, Req, ParseUUIDPipe } from "@nestjs/common"
import { ReviewsService } from "./reviews.service"
import { CreateReviewDto, CreateReviewSchema } from "./dto/create-review.dto"
import { UpdateReviewDto, UpdateReviewSchema } from "./dto/update-review.dto"
import { IReviewQuery } from "./interface/review-query-filter"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { ReviewInterceptor } from "./interceptor/review.interceptor"
import { ProductsService } from "../products/products.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { PolicyReviewGuard } from "./guard/policy-review.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { Review } from "./entities/review.entity"
import { Request } from "express"
import { OrdersService } from "../orders/orders.service"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { ConflictException } from "@/exceptions/conflict.exception"
import { ReviewsInterceptor } from "./interceptor/reviews.interceptor"
import { StoreService } from "../stores/store.service"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"

@Controller("reviews")
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private productService: ProductsService,
    private orderService: OrdersService,
    private storeService: StoreService,
    private transactionHelper: TransactionHelper
  ) {}

  @UseInterceptors(ReviewInterceptor)
  @UseGuards(PolicyReviewGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, Review))
  @Post()
  async create(@Body(new JoiValidationPipe(CreateReviewSchema)) createReviewDto: CreateReviewDto, @Req() req: Request) {
    const user = req.user
    if (!user) throw new NotFoundException("User not found")

    const product = await this.productService.findOne({ id: createReviewDto.productId })

    if (!product) throw new NotFoundException("Product does not exist")

    const reviews = await this.reviewsService.findOne({ reviewerId: user.id, productId: product.id })

    if (reviews) throw new ConflictException("You already reviewed this product")

    const orders = await this.orderService.findOne({ buyerId: user.id, items: { productId: product.id }, status: "paid" })

    if (!orders) {
      throw new BadReqException("Purchase the product to be able to review")
    }
    createReviewDto.reviewerId = user.id
    createReviewDto.productId = product.id

    return this.transactionHelper.runInTransaction(async (manager) => {
      await this.storeService.update(
        product.store,
        {
          totalStoreRatingCount: product.store.totalStoreRatingCount + 1,
          totalStoreRatingSum: product.store.totalStoreRatingSum + createReviewDto.rating
        },
        manager
      )

      await this.productService.update(
        product,
        {
          totalProductRatingCount: product.totalProductRatingCount + 1,
          totalProductRatingSum: product.totalProductRatingSum + createReviewDto.rating
        },
        manager
      )

      return await this.reviewsService.create(createReviewDto, manager)
    })
  }

  @UseInterceptors(ReviewsInterceptor)
  @UseGuards(PolicyReviewGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Review))
  @Get()
  async findAll(@Query() query: IReviewQuery) {
    return await this.reviewsService.find(query)
  }

  @UseInterceptors(ReviewInterceptor)
  @UseGuards(PolicyReviewGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Review))
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.reviewsService.findOne({ id })
  }

  @UseInterceptors(ReviewInterceptor)
  @UseGuards(PolicyReviewGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, Review))
  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body(new JoiValidationPipe(UpdateReviewSchema)) updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewsService.findById(id)

    if (!review) throw new NotFoundException("Review not found")

    return await this.reviewsService.update(review, updateReviewDto)
  }

  @UseGuards(PolicyReviewGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, Review))
  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return await this.reviewsService.remove({ id })
  }
}
