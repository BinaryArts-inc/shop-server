import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { User } from "@/modules/users/entity/user.entity"
import { VendorResponseMapper } from "../interface/vendor-response-mapper.interface"
import { IVendorResponse } from "../interface/vendor-response.interface"

@Injectable()
export class VendorInterceptor extends VendorResponseMapper implements NestInterceptor<User, IVendorResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<User>): Observable<IVendorResponse> | Promise<Observable<IVendorResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
