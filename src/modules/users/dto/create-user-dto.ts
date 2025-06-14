import { UserRoleEnum } from "../entity/user.entity"

export class CreateUserDto {
  firstName: string
  lastName: string
  password: string
  role: UserRoleEnum
  email: string
  isEmailVerified?: boolean
}
