import { Injectable } from "@nestjs/common"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Store, vendonEnumType } from "./entities/store.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { IStoresQuery } from "./interface/query-filter.interface"

@Injectable()
export class StoreService implements IService<Store> {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>
  ) {}

  readonly relations = ["business", "business.user"]

  async create(createStoreDto: CreateStoreDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository<Store>(Store) : this.storeRepository
    const store = repo.create({
      ...createStoreDto
    })
    return await repo.save(store)
  }

  async find({ limit, page, type, flag }: IStoresQuery): Promise<[Store[], number]> {
    const query = this.storeRepository
      .createQueryBuilder("store")
      .leftJoinAndSelect("store.business", "business")
      .leftJoinAndSelect("business.user", "user")

    if (type === vendonEnumType.PREMIUM) {
      query.andWhere("store.type = :type", { type })
    }

    if (flag === "top") {
      query.orderBy("store.numberOfSales", "DESC")
    }

    return await query
      .take(limit)
      .skip(page && page > 0 ? (page - 1) * limit : 0)
      .getManyAndCount()
  }

  async findById(id: string): Promise<Store> {
    return await this.storeRepository.findOne({ where: { id }, relations: this.relations })
  }

  async findOne(filter: FindOptionsWhere<Store>) {
    return await this.storeRepository.findOne({ where: filter, relations: this.relations })
  }

  async exists(filter: FindOptionsWhere<Store>): Promise<boolean> {
    return this.storeRepository.exists({ where: filter })
  }

  async update(entity: Store, data: UpdateStoreDto, manager?: EntityManager): Promise<Store> {
    const repo = manager ? manager.getRepository<Store>(Store) : this.storeRepository
    await repo.update({ id: entity.id }, { ...data })
    return this.findOne({ id: entity.id })
  }

  async remove(filter: FindOptionsWhere<Store>): Promise<number> {
    const store = await this.storeRepository.delete(filter)
    return store.raw
  }
}
