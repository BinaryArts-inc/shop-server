import { Request } from "express"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { JoiException } from "@/exceptions/joi.exception"
import { loginSchema } from "../dto/auth.dto"

@Injectable()
export class LoginValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest()

    const { error } = loginSchema.validate(req.body)

    if (error) {
      throw new JoiException(error.message.replace(/\"/g, ""))
    }

    return true
  }
}
