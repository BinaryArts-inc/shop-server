import { PartialType } from "@nestjs/mapped-types"
import { CreateUserDto } from "./create-user-dto"
import * as joi from "joi"

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export const updateUserSchema = joi.object({
  firstName: joi.string().optional(),
  lastName: joi.string().optional(),
  password: joi.string().optional(),
  role: joi.string().valid("customer", "vendor", "admin").optional(),
  address: joi.string().optional(),
  phoneNumber: joi.string().optional(),
  lastActivity: joi.date().optional()
})
