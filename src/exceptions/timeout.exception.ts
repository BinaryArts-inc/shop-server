import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class ReqTimeOutException extends ApiException {
  constructor(message?: string) {
    super(message || "Request Time out", HttpStatus.REQUEST_TIMEOUT)
  }
}
