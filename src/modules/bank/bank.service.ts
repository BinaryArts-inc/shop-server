import { Injectable } from "@nestjs/common"
import { CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Bank } from "./entities/bank.entity"
import { FindOptionsWhere, Repository } from "typeorm"

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>
  ) {}
  async create(createBankDto: CreateBankDto) {
    const createbank = this.bankRepository.create({ ...createBankDto })

    return await this.bankRepository.save(createbank)
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
    console.log(updateBankDto)
    return `This action updates a #${id} bank`
  }

  remove(id: number) {
    return `This action removes a #${id} bank`
  }
}
