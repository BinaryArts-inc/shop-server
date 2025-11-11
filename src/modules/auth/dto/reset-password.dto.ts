import * as Joi from "joi"

export class ResetPasswordDto {
  password: string
  confirmPassword: string
  token: string
}

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[a-z])")) // at least one lowercase letter
    .pattern(new RegExp("(?=.*[A-Z])")) // at least one uppercase letter
    .pattern(new RegExp("(?=.*\\d)")) // at least one digit
    .pattern(new RegExp("(?=.*[!@#$%^&*.])")) // at least one special character
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base": "Password must contain uppercase, lowercase, number, and special character"
    })
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({ "any.only": "Passwords do not match" })
})
