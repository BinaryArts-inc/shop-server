import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe, Req, UseGuards } from "@nestjs/common"
import { BankService } from "./bank.service"
import { bankSchema, CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto, updatebankSchema } from "./dto/update-bank.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { BankInterceptor } from "./interceptors/bank.interceptor"
import { ConflictException } from "@/exceptions/conflict.exception"
import { Request } from "express"
import { PoliciesGuard } from "../auth/guard/policies-handler.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Bank } from "./entities/bank.entity"
import { Action } from "../services/casl/actions/action"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { BanksInterceptor } from "./interceptors/banks.interceptor"
import { Public } from "../auth/decorators/public.decorator"
import { PaymentsService } from "../services/payments/payments.service"

@Controller("banks")
export class BankController {
  constructor(
    private readonly bankService: BankService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Bank))
  @UseInterceptors(BankInterceptor)
  async create(@Body(new JoiValidationPipe(bankSchema)) createBankDto: CreateBankDto, @Req() req: Request) {
    if (await this.bankService.exists({ accountNumber: createBankDto.accountNumber })) throw new ConflictException("Bank credentials already exist")
    const { code } = await this.paymentsService.createTransferRecipient({
      name: createBankDto.accountName,
      accountNumber: createBankDto.accountNumber,
      bankCode: createBankDto.code
    })
    return await this.bankService.create({ ...createBankDto, user: req.user, recipientCode: code })
  }

  @Get("available")
  @Public()
  async available() {
    return await this.paymentsService.getBanks()
  }

  @Get("")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Bank))
  @UseInterceptors(BanksInterceptor)
  async findAll(@Req() req: Request) {
    const user = req.user
    return await this.bankService.find({ user: { id: user.id } })
  }

  @Get(":id")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Bank))
  @UseInterceptors(BankInterceptor)
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.bankService.findOne({ id: id })
  }

  @Patch(":id")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Bank))
  async update(@Param("id") id: string, @Body(new JoiValidationPipe(updatebankSchema)) updateBankDto: UpdateBankDto) {
    const bank = await this.bankService.findOne({ id: id })
    return this.bankService.update(bank, updateBankDto)
  }

  @Delete(":id")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Bank))
  remove(@Param("id") id: string) {
    return this.bankService.remove({ id: id })
  }
}
