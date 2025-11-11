import * as Joi from "joi"

export class RefreshDto {
  refreshToken: string
}

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
})
