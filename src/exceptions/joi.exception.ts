import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class JoiException extends ApiException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY)
  }
}
