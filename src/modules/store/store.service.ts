import { Injectable } from "@nestjs/common"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Store } from "./entities/store.entity"
import { FindOptionsWhere, Repository } from "typeorm"
import { UserService } from "../user/user.service"
import Business from "../user/entity/business.entity"

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private userService: UserService
  ) {}
  async create(createStoreDto: CreateStoreDto, business: Business) {
    const store = this.storeRepository.create({
      ...createStoreDto,
      business: business
    })
    return await this.storeRepository.save(store)
  }

  findAll() {
    return `This action returns all store`
  }

  async findOne(filter: FindOptionsWhere<Store>) {
    return await this.storeRepository.findOne({ where: filter })
  }

  async exist(filter: FindOptionsWhere<Store>): Promise<boolean> {
    return this.storeRepository.exists({ where: filter })
  }

  update(id: number, updateStoreDto: UpdateStoreDto) {
    console.log(updateStoreDto)
    return `This action updates a #${id} store`
  }

  remove(id: number) {
    return `This action removes a #${id} store`
  }
}
