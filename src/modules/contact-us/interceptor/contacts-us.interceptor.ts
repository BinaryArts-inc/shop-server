import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { PaginationService } from "@/modules/services/pagination/pagination.service"
import { ContactUs } from "../entities/contact-us.entity"
import { ContactUsResponseMapper } from "../interface/contact-us-response-mapper.interface"
import { IContactsUsResponse } from "../interface/contacts-us-response.interface"
import { IContactUsResponse } from "../interface/contact-us-response.interface"

type PayloadType = [ContactUs[], number]

@Injectable()
export class ContactsUsResponseInterceptor extends ContactUsResponseMapper implements NestInterceptor<PayloadType, IContactsUsResponse> {
  constructor(private paginationService: PaginationService) {
    super()
  }

  intercept(context: ExecutionContext, next: CallHandler<PayloadType>): Observable<IContactsUsResponse> | Promise<Observable<IContactsUsResponse>> {
    const request = context.switchToHttp().getRequest()
    const { page, limit } = request.query

    return next.handle().pipe(map((data) => this.paginate(data, { page, limit })))
  }

  paginate([contactsUs, total]: PayloadType, params: PaginationParams): IContactsUsResponse {
    const data = contactsUs.map((contactUs) => this.transform(contactUs))
    return this.paginationService.paginate<IContactUsResponse>(data, total, params)
  }
}
