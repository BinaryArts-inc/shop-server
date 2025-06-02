import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards } from "@nestjs/common"
import { BankService } from "./bank.service"
import { bankSchema, CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { UserId } from "../user/decorator/user.decorator"
import { BankInterceptor } from "./interceptors/bank.interceptor"
import JwtShortTimeGuard from "../auth/guard/jwt-short-time.guard"
import { Short_Time } from "../auth/decorators/short-time.decorator"

@Controller("bank")
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Short_Time()
  @Post()
  @UseGuards(JwtShortTimeGuard)
  @UseInterceptors(BankInterceptor)
  async create(@Body(new JoiValidationPipe(bankSchema)) createBankDto: CreateBankDto, @UserId() userId: string) {
    return await this.bankService.create(createBankDto, userId)
  }

  @Get()
  findAll() {
    return this.bankService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
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
