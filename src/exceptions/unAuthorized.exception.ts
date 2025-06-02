import { HttpStatus } from '@nestjs/common'
import { ApiException } from './api.exception'

export class UnAuthorizedException extends ApiException {
   constructor(message?: string) {
      super(message ?? 'Not Authorized', HttpStatus.UNAUTHORIZED)
   }
}
