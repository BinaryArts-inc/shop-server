import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, Query, UseGuards, Res } from "@nestjs/common"
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
import { v4 as uuidv4 } from "uuid"
import { Response } from "express"
import { CsvService } from "../services/utils/csv/csv.service"

@Controller("subscriptions")
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private plansService: PlansService,
    private paymentService: PaymentsService,
    private readonly csvService: CsvService
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
      planCode: plan.planCode,
      reference: uuidv4()
    })

    createSubscriptionDto.vendorId = user.id
    createSubscriptionDto.reference = createSubscription.reference

    createSubscriptionDto.amount = plan.amount
    createSubscriptionDto.isPaid = false
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
  @Get("/downloads")
  async downloads(@Query() query: ISubscriptionsQuery, @Res() res: Response) {
    const [subscriptions] = await this.subscriptionService.find(query)

    const headers = [
      { key: "vendorName", header: "Vendor Name" },
      { key: "planType", header: "Plan Type" },
      { key: "startDate", header: "Start Date" },
      { key: "expiryDate", header: "Expiry Date" },
      { key: "status", header: "Status" }
    ]

    const records = subscriptions.map((sub) => {
      return {
        vendorName: sub.vendor.getFullName(),
        planType: sub.planType,
        startDate: sub.startDate.toISOString(),
        expiryDate: sub.endDate.toISOString(),
        status: sub.status
      }
    })

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=subscriptions.csv")
    res.send(data)
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
