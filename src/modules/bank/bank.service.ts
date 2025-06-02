import { Injectable } from "@nestjs/common"
import { CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Bank } from "./entities/bank.entity"
import { FindOptionsWhere, Repository } from "typeorm"
import { UserService } from "../user/user.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { ConflictException } from "@/exceptions/conflict.exception"

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
    private userService: UserService
  ) {}
  async create(createBankDto: CreateBankDto, userId: string) {
    const user = await this.userService.findOne({ id: userId })
    if (!user) throw new NotFoundException("User not found")

    if (await this.exist({ accountNumber: createBankDto.accountNumber })) throw new ConflictException("Bank credentials already exist")

    const createbank = this.bankRepository.create({
      ...createBankDto,
      user: user
    })

    const savedBank = await this.bankRepository.save(createbank)

    const bank = await this.findOne({ id: savedBank.id })

    return bank
  }

  findAll() {
    return `This action returns all bank`
  }

  async findOne(filter: FindOptionsWhere<Bank>) {
    return this.bankRepository.findOne({ where: filter, relations: ["user"] })
  }

  async exist(filter: FindOptionsWhere<Bank>): Promise<boolean> {
    return await this.bankRepository.exists({ where: filter })
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    return `This action updates a #${id} bank`
  }

  remove(id: number) {
    return `This action removes a #${id} bank`
  }
}
