import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, Query, UseGuards } from "@nestjs/common"
import { SubscriptionService } from "./subscription.service"
import { createSubcriptionSchema, CreateSubscriptionDto } from "./dto/create-subscription.dto"
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { PlansService } from "../plans/plans.service"
import { Request } from "express"
import { PaymentsService } from "../services/payments/payments.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { SubscriptionsInterceptor } from "./interceptor/subscriptions.interceptor"
import { SubscriptionInterceptor } from "./interceptor/subscription.interceptor"
import { GetSubscriptionPayload, ISubscriptionsQuery } from "./interface/query-filter.interface"
import { PolicySubscriptionGuard } from "./guard/policy-subscription.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { Subscription } from "./entities/subscription.entity"

@Controller("subscriptions")
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private plansService: PlansService,
    private paymentService: PaymentsService
  ) {}

  @UseInterceptors(SubscriptionInterceptor)
  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Subscription))
  @Post()
  async create(@Body(new JoiValidationPipe(createSubcriptionSchema)) createSubscriptionDto: CreateSubscriptionDto, @Req() req: Request) {
    const user = req.user
    const plan = await this.plansService.findOne({ planCode: createSubscriptionDto.planCode })
    if (!plan) throw new NotFoundException("plan not found")

    const createSubscription = await this.paymentService.createSubscription({
      amount: createSubscriptionDto.amount,
      email: user.email,
      planCode: plan.planCode
    })

    createSubscriptionDto.vendorId = user.id
    createSubscriptionDto.reference = createSubscription.reference

    const subscription = await this.subscriptionService.create(createSubscriptionDto)

    return {
      ...subscription,
      payment: createSubscription
    }
  }

  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Subscription))
  @UseInterceptors(SubscriptionsInterceptor)
  @Get()
  async findAll(@Query() query: ISubscriptionsQuery) {
    return await this.subscriptionService.find(query)
  }

  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Subscription))
  @Get("/subscriber")
  async getSubscriptions(@Query() query: GetSubscriptionPayload) {
    return await this.subscriptionService.getSubscription(query)
  }

  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Subscription))
  @UseInterceptors(SubscriptionInterceptor)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.subscriptionService.findOne({ id: id })
  }

  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Subscription))
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionService.findOne({ id: id })
    if (!subscription) {
      throw new NotFoundException("Subscription does not exist")
    }
    return await this.subscriptionService.update(subscription, updateSubscriptionDto)
  }

  @UseGuards(PolicySubscriptionGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Subscription))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.subscriptionService.remove({ id: id })
  }
}
