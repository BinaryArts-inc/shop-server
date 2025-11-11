import { AppAbility, CaslAbilityFactory } from "@/modules/services/casl/casl-ability.factory"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { PolicyHandler } from "../interface/policies-interface"
import { CHECK_POLICIES_KEY } from "../decorators/policies-handler.decorator"

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || []

    const { user } = context.switchToHttp().getRequest()
    const ability = this.caslAbilityFactory.createForUser(user)
    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability))
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === "function") {
      return handler(ability)
    }
    return handler.handle(ability)
  }
}
