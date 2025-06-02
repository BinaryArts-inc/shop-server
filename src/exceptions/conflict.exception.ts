import { HttpStatus } from "@nestjs/common"
import { ApiException } from "./api.exception"

export class ConflictException extends ApiException {
  constructor(message?: string) {
    super(message || "conflict", HttpStatus.CONFLICT)
  }
}
