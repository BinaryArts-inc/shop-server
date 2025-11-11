import * as Joi from "joi"

export class ForgotPasswordDto {
  email: string
}

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
})
