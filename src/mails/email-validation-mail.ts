import { Otp } from "@/modules/auth/entities/otp.entity"
import { Attachment, Content, Envelope, Header, Mailable } from "@/modules/services/mail"

export class EmailValidationMail extends Mailable {
  constructor(private readonly otp: Otp) {
    super()
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.otp.email,
      subject: "Email Validation"
    })
  }

  public content(): Content {
    return new Content({
      text: `Validate with your otp code: ${this.otp.code}. Your code expires in 10mins`
    })
  }

  public attachments(): Attachment[] {
    return []
  }

  public headers(): Header[] {
    return []
  }
}
