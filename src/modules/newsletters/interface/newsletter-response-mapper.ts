import { Newsletter } from "../entities/newsletter.entity"
import { INewsletterResponse } from "./newsletter-response.interface"

export abstract class NewsletterResponseMapper implements IInterceptor {
  transform(data: Newsletter): INewsletterResponse {
    return {
      id: data.id,
      email: data.email
    }
  }
}
