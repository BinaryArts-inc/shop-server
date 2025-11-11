import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class ForbiddenException extends ApiException {
  constructor(message?: string) {
    super(message || "Forbidden", HttpStatus.FORBIDDEN)
  }
}
