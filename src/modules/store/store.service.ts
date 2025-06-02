import { Injectable } from "@nestjs/common"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Store } from "./entities/store.entity"
import { FindOptionsWhere, Repository } from "typeorm"
import { UserService } from "../user/user.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { HelpersService } from "../services/utils/helpers/helpers.service"
import { ConfigService } from "@nestjs/config"
import { IAuth } from "@/config/auth.config"
import { ConflictException } from "@/exceptions/conflict.exception"

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private userService: UserService,
    private helperService: HelpersService,
    private configService: ConfigService
  ) {}
  async create(createStoreDto: CreateStoreDto, userId: string) {
    const business = await this.userService.getUserBusiness({ user: { id: userId } })
    if (!business) throw new NotFoundException("Business does not exist")

    if (await this.exist({ name: createStoreDto.name })) throw new ConflictException("Store name already exist")

    const store = this.storeRepository.create({
      ...createStoreDto,
      business: business
    })
    await this.storeRepository.save(store)
    const payload = { email: business.user.email, id: business.user.id }
    const token = await this.helperService.generateToken(payload, this.configService.get<IAuth>("auth").shortTimeJwtSecret, "1h")
    return { token }
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
    return `This action updates a #${id} store`
  }

  remove(id: number) {
    return `This action removes a #${id} store`
  }
}
