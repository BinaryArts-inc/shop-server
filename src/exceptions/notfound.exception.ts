import { HttpStatus } from '@nestjs/common'
import { ApiException } from './api.exception'

export class NotFoundException extends ApiException {
   constructor(message?: string) {
      super(message || 'Not Found', HttpStatus.NOT_FOUND)
   }
}
