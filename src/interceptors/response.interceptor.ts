import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data
      }))
    )
  }
}
