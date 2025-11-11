import { Injectable } from "@nestjs/common"
import { CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Bank } from "./entities/bank.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"

@Injectable()
export class BankService implements IService<Bank> {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>
  ) {}
  async create(createBankDto: CreateBankDto, manager?: EntityManager): Promise<Bank> {
    const repo = manager ? manager.getRepository<Bank>(Bank) : this.bankRepository
    const createbank = repo.create({ ...createBankDto })

    return await repo.save(createbank)
  }

  async find(data?: FindOptionsWhere<Bank>): Promise<[Bank[], number]> {
    return await this.bankRepository.findAndCount({ where: data })
  }

  async findOne(filter: FindOptionsWhere<Bank>) {
    return this.bankRepository.findOne({ where: filter, relations: ["user"] })
  }

  async exists(filter: FindOptionsWhere<Bank>): Promise<boolean> {
    return await this.bankRepository.exists({ where: filter })
  }

  async findById(id: string): Promise<Bank> {
    return await this.bankRepository.findOne({ where: { id: id } })
  }

  async update(entity: Bank, data: UpdateBankDto, manager?: EntityManager): Promise<Bank> {
    const repo = manager ? manager.getRepository<Bank>(Bank) : this.bankRepository
    const bank = repo.create({ ...entity, ...data })
    return await repo.save(bank)
  }

  async remove(filter: FindOptionsWhere<Bank>): Promise<number> {
    const bank = await this.bankRepository.delete(filter)
    return bank.affected
  }
}
