import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { CreateUserDto } from "./dto/create-user-dto"
import { ConflictException } from "@/exceptions/conflict.exception"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { UpdateUserDto } from "./dto/update-user-dto"
import { User, UserRoleEnum } from "./entity/user.entity"
import { IUserQuery } from "./interfaces/users-query.interface"
import { HeadersRecordsInterface } from "./interfaces/user-headers-records"

@Injectable()
export class UserService implements IService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  private readonly relations = ["business", "business.store"]

  async create(data: CreateUserDto, manager?: EntityManager): Promise<User> {
    const exist = await this.exists({ email: data.email })

    if (exist) throw new ConflictException("User exists")

    const repo = manager ? manager.getRepository<User>(User) : this.userRepository

    const createUser = repo.create({ ...data })
    return await repo.save(createUser)
  }

  async find({ limit, page, role, search, status }: IUserQuery): Promise<[User[], number]> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.business", "business")
      .leftJoinAndSelect("business.store", "store")
      .leftJoinAndSelect("user.orders", "orders")
      .leftJoinAndSelect("orders.items", "items")
      .leftJoinAndSelect("user.subscriptions", "subscriptions")

    if (role) {
      query.andWhere("user.role = :role", { role })
    }

    if (status) {
      query.andWhere("user.status = :status", { status })
    }

    if (search) {
      query.andWhere("LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search", {
        search: `%${search.toLowerCase()}%`
      })
    }

    return await query
      .take(limit)
      .skip(page && page > 0 ? (page - 1) * limit : 0)
      .getManyAndCount()
  }

  async findById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: this.relations
    })
  }

  async findOne(filter: FindOptionsWhere<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: filter,
      relations: this.relations
    })
    if (!user) throw new BadReqException("User not found")
    return user
  }

  exists(filter: FindOptionsWhere<User>): Promise<boolean> {
    return this.userRepository.exists({ where: filter })
  }

  async update(entity: User, data: UpdateUserDto, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository<User>(User) : this.userRepository
    const merged = repo.merge(entity, data)
    return repo.save(merged)
  }

  async remove(filter: FindOptionsWhere<User>): Promise<number> {
    const result = await this.userRepository.delete(filter)

    return result.affected
  }

  async headersRecords(query: IUserQuery, users: User[]): Promise<HeadersRecordsInterface> {
    const role = query.role

    if (role === UserRoleEnum.Customer) {
      const headers = [
        { key: "name", header: "Name" },
        { key: "phoneNumber", header: "Phone Number" },
        { key: "emailAddress", header: "Email Address" },
        { key: "orders", header: "Orders" },
        { key: "status", header: "Status" }
      ]

      const records = users.map((user) => {
        return {
          name: user.getFullName(),
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          orders: user.ordersCount,
          status: user.status
        }
      })

      return { headers, records }
    } else if (role === UserRoleEnum.Vendor) {
      const headers = [
        { key: "name", header: "Name" },
        { key: "phoneNumber", header: "Phone Number" },
        { key: "emailAddress", header: "Email Address" },
        { key: "kycStatus", header: "Kyc Status" },
        { key: "orders", header: "Orders" },
        { key: "status", header: "Status" }
      ]

      const records = users.map((user) => {
        return {
          name: user.getFullName(),
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          orders: user.itemsCount,
          kycStatus: user.business.kycStatus,
          status: user.status
        }
      })

      return { headers, records }
    } else {
      const headers = [
        { key: "name", header: "Name" },
        { key: "phoneNumber", header: "Phone Number" },
        { key: "emailAddress", header: "Email Address" },
        { key: "status", header: "Status" }
      ]

      const records = users.map((user) => {
        return {
          name: user.getFullName(),
          phoneNumber: user.phoneNumber,
          emailAddress: user.email,
          status: user.status
        }
      })

      return { records, headers }
    }
  }
}
