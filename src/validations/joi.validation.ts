import { PipeTransform, Injectable } from "@nestjs/common"
import { ObjectSchema } from "joi"
import { JoiException } from "../exceptions/joi.exception"

const options = {
  errors: {
    wrap: {
      label: "",
      message: ""
    }
  }
}

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, options)

    if (error) {
      throw new JoiException(error.message.replace(/\"/g, ""))
    }

    return value
  }
}
