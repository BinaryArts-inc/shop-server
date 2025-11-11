import { Attachment, Content, Envelope, Header, Mailable } from "@/modules/services/mail"

export class PasswordRestMail extends Mailable {
  constructor(
    private readonly link: string,
    private readonly to: string
  ) {
    super()
  }

  public envelope(): Envelope {
    return new Envelope({
      to: this.to,
      subject: "Password Reset Link"
    })
  }

  public content(): Content {
    return new Content({
      text: `see attached ${this.link} and it expires in 1 hour`
    })
  }

  public attachments(): Attachment[] {
    return []
  }

  public headers(): Header[] {
    return []
  }
}
