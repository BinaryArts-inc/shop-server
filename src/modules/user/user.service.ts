import { Injectable } from "@nestjs/common"
import User from "./entity/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { CreateUserDto } from "./dto/createUserDto"
import { ConflictException } from "@/exceptions/conflict.exception"
import { BadReqException } from "@/exceptions/badRequest.exception"
import Business from "./entity/business.entity"
import { CreateUserBusinessDto } from "./dto/business.dto"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { UpdateUserDto } from "./dto/updateUserDto"

@Injectable()
export class UserService implements IService<User> {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>
  ) {}

  async create(data: CreateUserDto, manager?: EntityManager): Promise<User> {
    const exist = await this.exists({ email: data.email })

    if (exist) throw new ConflictException("User exists")

    const repo = manager ? manager.getRepository<User>(User) : this.UserRepository

    const createUser = repo.create({ ...data })
    return await repo.save(createUser)
  }

  find(data: FindOptionsWhere<User>): Promise<[User[], number]> {
    console.log("data", data)

    throw new Error("Method not implemented.")
  }

  findById(id: string): Promise<User> {
    return this.UserRepository.findOne({ where: { id: id } })
  }

  async findOne(filter: FindOptionsWhere<User>): Promise<User> {
    const user = await this.UserRepository.findOne({ where: filter, relations: ["business", "business.store"] })
    if (!user) throw new BadReqException("User not found")
    return user
  }

  exists(filter: FindOptionsWhere<User>): Promise<boolean> {
    return this.UserRepository.exists({ where: filter })
  }

  async update(entity: User, data: UpdateUserDto, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository<User>(User) : this.UserRepository
    await repo.update({ id: entity.id }, { ...data })
    const updatedUser = await repo.findOne({ where: { id: entity.id } })
    if (!updatedUser) throw new NotFoundException("User not found after update")
    return updatedUser
  }

  remove(filter: FindOptionsWhere<User>): Promise<number> {
    console.log(filter)

    throw new Error("")
  }

  async createUserBusiness(userBusinessDto: CreateUserBusinessDto, user: User) {
    const business = this.businessRepository.create({
      ...userBusinessDto,
      user: user
    })
    return await this.businessRepository.save(business)
  }

  async findOneBusiness(filter: FindOptionsWhere<Business>) {
    return await this.businessRepository.findOne({ where: filter, relations: ["user", "store"] })
  }

  async getUserBusiness(filter: FindOptionsWhere<Business>) {
    return await this.businessRepository.findOne({ where: filter, relations: ["user", "store"] })
  }
}
