import { HttpException } from "@nestjs/common"

export class ApiException extends HttpException {
  constructor(message: string, statusCode: number) {
    super({ success: false, message }, statusCode)
  }
}
