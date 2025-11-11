import { Injectable } from "@nestjs/common"
import Business from "./entities/business.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { CreateBusinessDto } from "./dto/create-business-dto"
import { IBusinessQuery } from "./interface/businesses-query.interface"

@Injectable()
export class BusinessService implements IService<Business> {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>
  ) {}

  async create(data: CreateBusinessDto, manager?: EntityManager): Promise<Business> {
    const repo = manager ? manager.getRepository(Business) : this.businessRepository
    const entity = repo.create({ ...data })
    return await repo.save(entity)
  }

  async find({ page, limit, ...where }: IBusinessQuery): Promise<[Business[], number]> {
    const [result, count] = await this.businessRepository.findAndCount({
      where,
      take: limit,
      skip: page ? (page - 1) * limit : undefined,
      relations: ["user", "store"]
    })

    return [result, count]
  }

  async findById(id: string): Promise<Business> {
    const entity = await this.businessRepository.findOne({ where: { id }, relations: ["user", "store"] })
    return entity
  }

  async findOne(filter: FindOptionsWhere<Business>): Promise<Business> {
    const entity = await this.businessRepository.findOne({ where: filter, relations: ["user", "store"] })
    return entity
  }

  async exists(filter: FindOptionsWhere<Business>): Promise<boolean> {
    const count = await this.businessRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Business, data: Partial<Business>, manager?: EntityManager): Promise<Business> {
    const repo = manager ? manager.getRepository(Business) : this.businessRepository
    const merged = repo.merge(entity, data)
    return await repo.save(merged)
  }

  async remove(filter: FindOptionsWhere<Business>): Promise<number> {
    const entities = await this.businessRepository.find({ where: filter })
    const result = await this.businessRepository.remove(entities)
    return result.length
  }
}
