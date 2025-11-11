import { map, Observable } from "rxjs"
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { ContactUsResponseMapper } from "../interface/contact-us-response-mapper.interface"
import { ContactUs } from "../entities/contact-us.entity"
import { IContactUsResponse } from "../interface/contact-us-response.interface"

@Injectable()
export class ContactUsResponseInterceptor extends ContactUsResponseMapper implements NestInterceptor<ContactUs, IContactUsResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<ContactUs>): Observable<IContactUsResponse> | Promise<Observable<IContactUsResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
