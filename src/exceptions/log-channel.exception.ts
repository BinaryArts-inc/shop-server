import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class LogChannelException extends ApiException {
  constructor(message?: string) {
    super(message || "The specified log channel is invalid or not configured.", HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
