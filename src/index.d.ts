import { EntityManager, FindOptionsWhere } from "typeorm"
import { User as AppUser } from "./modules/users/entity/user.entity"

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
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

  export enum PaystackEventEnum {
    "success" = "success",
    "failed" = "failed"
  }

  export interface QueueDispatch<T extends string, K> {
    name: T
    data: K
    jobOptions?: JobsOptions
  }

  export interface UseQueue<T extends string, K> {
    dispatch: (options: QueueDispatch<T, K>) => Promise<void>
  }
}
