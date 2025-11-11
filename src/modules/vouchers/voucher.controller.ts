import { Controller, Get, Body, Patch, Param, Delete, Query, Req, UseInterceptors, UseGuards } from "@nestjs/common"
import { VoucherService } from "./voucher.service"
import { UpdateVoucherDto } from "./dto/update-voucher.dto"
import { IVoucherQueryFilter } from "./interface/query-filter"
import { Request } from "express"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { VoucherEnum } from "./enum/voucher-enum"
import { UserRoleEnum } from "../users/entity/user.entity"
import { VouchersInterceptor } from "./interceptor/vouchers.interceptor"
import { VoucherInterceptor } from "./interceptor/voucher.interceptor"
import { PolicyVouchersGuard } from "./guard/policy-voucher.guard"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Voucher } from "./entities/voucher.entity"
import { Action } from "../services/casl/actions/action"

@Controller("vouchers")
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @UseGuards(PolicyVouchersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Voucher))
  @UseInterceptors(VouchersInterceptor)
  @Get()
  findAll(@Query() query: IVoucherQueryFilter, @Req() req: Request) {
    const user = req.user

    if (user.role === UserRoleEnum.Customer) {
      query.userId = user.id
    }

    return this.voucherService.find(query)
  }

  @UseGuards(PolicyVouchersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Voucher))
  @Get("validate")
  async validateVoucher(@Query() code: string, @Req() req: Request) {
    if (!code) {
      throw new BadReqException("coupon code is required")
    }
    const user = req.user

    const voucher = await this.voucherService.findOne({ userId: user.id, code: code })

    if (!voucher) {
      throw new NotFoundException("Voucher for user currently does not exist")
    }

    if (voucher.status === VoucherEnum.REDEEMED || voucher.status === VoucherEnum.EXPIRED) {
      throw new BadReqException("Voucher already used or expired")
    }

    return "Voucher is valid"
  }

  @UseGuards(PolicyVouchersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Voucher))
  @UseInterceptors(VoucherInterceptor)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.voucherService.findOne({ id })
  }

  @UseGuards(PolicyVouchersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Voucher))
  @UseInterceptors(VoucherInterceptor)
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    const voucher = await this.voucherService.findById(id)
    return this.voucherService.update(voucher, updateVoucherDto)
  }

  @UseGuards(PolicyVouchersGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Voucher))
  @UseInterceptors(VoucherInterceptor)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.voucherService.remove({ id })
  }
}
