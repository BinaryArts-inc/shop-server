import * as joi from "joi"
import { UserRoleEnum } from "@/modules/users/entity/user.entity"

export class AuthDto {
  firstName: string
  lastName: string
  email: string
  role: UserRoleEnum
  password: string
  confirmPassword: string
}

export class VerifyEmailDto {
  code: string
}

export class ResendOtpDto {
  email: string
}

export class LoginDto {
  email: string
  password: string
  fcmToken?: string
}
export class LogoutDto {
  fcmToken?: string
}
export class LoginAuthDto {
  email: string
  id: string
}

export const registerSchema = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  email: joi.string().email().required(),
  role: joi.string().valid("customer", "vendor", "admin").required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
    "any.only": "Passwords do not match"
  })
})

export const verifyEmailSchema = joi.object({
  code: joi.number().required()
})

export const resendOtpSchema = joi.object({
  email: joi.string().email().required()
})

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  fcmToken: joi.string().optional()
})

export const logoutSchema = joi.object({
  fcmToken: joi.string().optional()
})
