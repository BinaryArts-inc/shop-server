import * as joi from "joi"

export class RemoveImageDto {
  imageUrl: string
}

export const removeImageSchema = joi.object({
  imageUrl: joi.string().required()
})
