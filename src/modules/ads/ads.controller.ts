import { Controller, Get, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query, ParseUUIDPipe, Post, Req, Res } from "@nestjs/common"
import { AdsService } from "./ads.service"
import { PolicyAdsGuard } from "./guards/policy.ads.guards"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { Ad } from "./entities/ad.entity"
import { AdsResponseInterceptor } from "./interceptors/ads-response.interceptor"
import { IAdsQuery } from "./interfaces/query-interface-filter"
import { AdResponseInterceptor } from "./interceptors/ad-response.interceptor"
import { UpdateAdDto } from "./dto/update-ad.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateAdDto, createAdSchema } from "./dto/create-ad.dto"
import { Request } from "express"
import { ProductsService } from "../products/products.service"
import { PromotionsService } from "../promotions/promotions.service"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { InitiatePayment } from "../services/payments/interfaces/strategy.interface"
import { PaymentsService } from "../services/payments/payments.service"
import { ProductStatusEnum } from "../common/types"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { CsvService } from "../services/utils/csv/csv.service"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Response } from "express"
import { HelpersService } from "../services/utils/helpers/helpers.service"

@Controller("ads")
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly productsService: ProductsService,
    private readonly promotionsService: PromotionsService,
    private readonly paymentsService: PaymentsService,
    private readonly csvService: CsvService,
    private readonly helperService: HelpersService
  ) {}

  @Post("")
  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, Ad))
  async create(@Body(new JoiValidationPipe(createAdSchema)) dto: CreateAdDto, @Req() req: Request) {
    const user = req.user
    const [product, promotion] = await Promise.all([
      this.productsService.findOne({ id: dto.productId, status: ProductStatusEnum.published }),
      this.promotionsService.findById(dto.promotionId)
    ])
    if (!product) throw new NotFoundException("Product does not exist")
    if (!promotion) throw new NotFoundException("promotion does not exist")

    const itExist = await this.adsService.exists({
      productId: dto.productId,
      status: "active",
      promotionId: promotion.id
    })

    if (itExist) {
      throw new BadReqException(`An active promotion ad of type '${promotion.type}' already exists for this product`)
    }

    const reference = this.helperService.generateReference("REF-")
    const ad = await this.adsService.create({
      duration: promotion.duration,
      productId: product.id,
      type: promotion.type,
      promotionId: promotion.id,
      paymentMethod: dto.paymentMethod,
      amount: promotion.amount,
      reference: reference
    })

    const payload: InitiatePayment = {
      amount: promotion.amount,
      email: user.email,
      reference: ad.reference
    }

    return await this.paymentsService.with(dto.paymentMethod).initiatePayment(payload)
  }

  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Ad))
  @UseInterceptors(AdsResponseInterceptor)
  @Get()
  findAll(@Query() query: IAdsQuery) {
    return this.adsService.find(query)
  }

  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Ad))
  @Get("/download")
  async download(@Query() query: IAdsQuery, @Res() res: Response) {
    const [ads] = await this.adsService.find(query)

    const headers = [
      { key: "vendorName", header: "Vendor Name" },
      { key: "products", header: "Products" },
      { key: "duration", header: "Duration" },
      { key: "amount", header: "Amount" },
      { key: "startDate", header: "Start Date" },
      { key: "expiryDate", header: "Expiry Date" },
      { key: "status", header: "Status" }
    ]

    const records = ads.map((ad) => {
      return {
        vendorName: ad.product.store.business.user.getFullName(),
        products: ad.product.name,
        duration: ad.duration,
        amount: ad.amount,
        startDate: ad.startDate.toISOString(),
        expiryDate: ad.endDate.toISOString(),
        status: ad.status
      }
    })

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=ads.csv")
    res.send(data)
  }

  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Ad))
  @UseInterceptors(AdResponseInterceptor)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adsService.findOne({ id: id })
  }

  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, Ad))
  @UseInterceptors(AdResponseInterceptor)
  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() updateAdDto: UpdateAdDto) {
    const ads = await this.adsService.findOne({ id })
    if (!ads) throw new NotFoundException("Ads could not be found")
    return this.adsService.update(ads, updateAdDto)
  }

  @UseGuards(PolicyAdsGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, Ad))
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.adsService.remove({ id: id })
  }
}
