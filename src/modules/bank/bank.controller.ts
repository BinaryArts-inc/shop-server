import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe } from "@nestjs/common"
import { BankService } from "./bank.service"
import { bankSchema, CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { BankInterceptor } from "./interceptors/bank.interceptor"
import { ConflictException } from "@/exceptions/conflict.exception"

@Controller("bank")
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @UseInterceptors(BankInterceptor)
  async create(@Body(new JoiValidationPipe(bankSchema)) createBankDto: CreateBankDto) {
    if (await this.bankService.exist({ accountNumber: createBankDto.accountNumber })) throw new ConflictException("Bank credentials already exist")

    return await this.bankService.create(createBankDto)
  }

  @Get()
  findAll() {
    return this.bankService.findAll()
  }

  @Get(":id")
  @UseInterceptors(BankInterceptor)
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
