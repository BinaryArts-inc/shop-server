import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class BadReqException extends ApiException {
  constructor(message?: string) {
    super(message || "Bad Request", HttpStatus.BAD_REQUEST)
  }
}
