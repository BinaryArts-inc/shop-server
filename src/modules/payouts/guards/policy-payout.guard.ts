import { Reflector } from "@nestjs/core"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

import { PolicyHandler } from "../../auth/interface/policies-interface"
import { CHECK_POLICIES_KEY } from "../../auth/decorators/policies-handler.decorator"
import { AppAbility, CaslAbilityFactory } from "@/modules/services/casl/casl-ability.factory"

@Injectable()
export class PolicyPayoutGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || []

    const { user } = context.switchToHttp().getRequest()

    const ability = this.caslAbilityFactory.createAbilityForPayout(user)

    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability))
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === "function") {
      return handler(ability)
    }
    return handler.handle(ability)
  }
}
