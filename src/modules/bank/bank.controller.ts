import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { BankService } from "./bank.service"
import { bankSchema, CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { BankInterceptor } from "./interceptors/bank.interceptor"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { ShortTime } from "../auth/decorators/short-time.decorator"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { UserService } from "../user/user.service"
import { ConflictException } from "@/exceptions/conflict.exception"
import { ProductInterceptor } from "../products/interceptors/product.interceptor"
import { User } from "../user/decorator/user.decorator"

@Controller("bank")
export class BankController {
  constructor(
    private readonly bankService: BankService,
    private userService: UserService
  ) {}

  @ShortTime()
  @Post()
  @UseGuards(JwtShortTimeGuard)
  @UseInterceptors(BankInterceptor)
  async create(@Body(new JoiValidationPipe(bankSchema)) createBankDto: CreateBankDto, @User("id") userId: string) {
    const user = await this.userService.findOne({ id: userId })
    if (!user) throw new NotFoundException("User not found")

    if (await this.bankService.exist({ accountNumber: createBankDto.accountNumber })) throw new ConflictException("Bank credentials already exist")

    return await this.bankService.create(createBankDto, user)
  }

  @Get()
  findAll() {
    return this.bankService.findAll()
  }

  @Get(":id")
  @UseInterceptors(ProductInterceptor)
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.bankService.findOne({ id: id })
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(+id, updateBankDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bankService.remove(+id)
  }
}
