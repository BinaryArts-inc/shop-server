import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UseGuards, Req } from "@nestjs/common"
import { CouponsService } from "./coupons.service"
import { CreateCouponDto, createCouponSchema } from "./dto/create-coupon.dto"
import { UpdateCouponDto } from "./dto/update-coupon.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { ICouponsQuery } from "./interface/query-filter.interface"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { CouponInterceptor } from "./interceptor/coupon.interceptor"
import { PolicyCouponGuard } from "./guard/policy-coupon.guard"
import { Action } from "../services/casl/actions/action"
import { Coupon } from "./entities/coupon.entity"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { CouponsResponseInterceptor } from "./interceptor/coupons.interceptor"
import { VoucherService } from "../vouchers/voucher.service"
import { Request } from "express"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"
import { BadReqException } from "@/exceptions/badRequest.exception"

@Controller("coupons")
export class CouponsController {
  constructor(
    private readonly couponsService: CouponsService,
    private helperService: HelpersService,
    private readonly voucherService: VoucherService,
    private readonly transactionHelper: TransactionHelper
  ) {}

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Coupon))
  @Post()
  create(@Body(new JoiValidationPipe(createCouponSchema)) createCouponDto: CreateCouponDto) {
    createCouponDto.remainingQuantity = createCouponDto.quantity
    createCouponDto.code = this.helperService.generateCouponCode(8)
    return this.couponsService.create(createCouponDto)
  }

  @UseInterceptors(CouponsResponseInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Coupon))
  @Get()
  findAll(@Query() query: ICouponsQuery) {
    return this.couponsService.find(query)
  }

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Coupon))
  @Get("stats")
  async getStats() {
    return await this.couponsService.couponStats()
  }

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Coupon))
  @Get("draw")
  async draw(@Req() req: Request) {
    const user = req.user

    const coupon = await this.couponsService.findRandomCoupon()

    await this.transactionHelper.runInTransaction(async (manager) => {
      // add a scheduler to update the status of the voucher to expired if after its end date
      await this.voucherService.create(
        {
          code: coupon.code,
          dateWon: new Date(),
          prizeType: coupon.couponType,
          prizeWon: coupon.value,
          userId: user.id,
          startDate: coupon.startDate,
          endDate: coupon.endDate
        },
        manager
      )

      await this.couponsService.update(coupon, { remainingQuantity: coupon.remainingQuantity - 1 }, manager)
    })

    return coupon
  }

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Coupon))
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.couponsService.findOne({ id: id })
  }

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Coupon))
  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponsService.findById(id)
    if (!coupon) {
      throw new NotFoundException("Coupon not found")
    }

    const [voucher] = await this.voucherService.find({ code: coupon.code })

    if (voucher.length > 0) {
      throw new BadReqException("Coupon is already in use")
    }

    updateCouponDto.remainingQuantity = updateCouponDto.quantity ? coupon.remainingQuantity + updateCouponDto.quantity : updateCouponDto.quantity
    updateCouponDto.quantity = updateCouponDto.quantity ? coupon.quantity + updateCouponDto.quantity : updateCouponDto.quantity
    return this.couponsService.update(coupon, updateCouponDto)
  }

  @UseInterceptors(CouponInterceptor)
  @UseGuards(PolicyCouponGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Coupon))
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.couponsService.remove({ id })
  }
}
