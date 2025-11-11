import { CHECK_POLICIES_KEY } from "@/modules/auth/decorators/policies-handler.decorator"
import { PolicyHandler } from "@/modules/auth/interface/policies-interface"
import { AppAbility, CaslAbilityFactory } from "@/modules/services/casl/casl-ability.factory"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

@Injectable()
export class PolicyNewsletterGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || []

    const { user } = context.switchToHttp().getRequest()
    const ability = this.caslAbilityFactory.createUserAbilityForNewsletter(user)
    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability))
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === "function") {
      return handler(ability)
    }
    return handler.handle(ability)
  }
}
