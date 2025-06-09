import { EntityManager, FindOptionsWhere } from "typeorm"
import { User } from "./modules/user/entity/user.entity"

declare module "Express" {
  interface Request {
    user: User
  }
}

declare global {
  interface JwtPayload {
    id: string
    email: string
  }

  interface IService<T> {
    create(data: unknown, manager?: EntityManager): Promise<T>
    find(data: unknown): Promise<[T[], number]>
    findById(id: string): Promise<T>
    findOne(filter: FindOptionsWhere<T>): Promise<T>
    exists(filter: FindOptionsWhere<T>): Promise<boolean>
    update(entity: T, data: unknown, manager?: EntityManager): Promise<T>
    remove(filter: FindOptionsWhere<T>): Promise<number>
  }

  interface IPasswordGenerateOptions {
    length?: number
    numbers?: boolean
    symbols?: boolean | string
    exclude?: string
    uppercase?: boolean
    lowercase?: boolean
    excludeSimilarCharacters?: boolean
    strict?: boolean
  }

  type IdName = {
    id: string
    name: string
  }

  interface IInterceptor {
    transform(data: unknown): unknown
  }

  export interface CustomFile extends Express.Multer.File {
    extension?: string
  }
}
