import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import UserEntity from "../entity/user.entity"
import { Request } from "express"

export const User = createParamDecorator((data: keyof UserEntity, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const user = request.user

  return data ? user?.[data] : user
})
