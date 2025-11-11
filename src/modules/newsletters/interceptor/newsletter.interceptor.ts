import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { NewsletterResponseMapper } from "../interface/newsletter-response-mapper"
import { Newsletter } from "../entities/newsletter.entity"
import { INewsletterResponse } from "../interface/newsletter-response.interface"
import { map, Observable } from "rxjs"

@Injectable()
export class NewsletterResponseInterceptor extends NewsletterResponseMapper implements NestInterceptor<Newsletter, INewsletterResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Newsletter>): Observable<INewsletterResponse> | Promise<Observable<INewsletterResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
