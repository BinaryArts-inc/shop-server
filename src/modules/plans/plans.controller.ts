import { Controller, Post, Body, Get, Patch, Param, ParseUUIDPipe, UseInterceptors, UseGuards } from "@nestjs/common"
import { PlansService } from "./plans.service"
import { CreatePlanDto, createPlanSchema } from "./dto/create-plan.dto"
import { PaymentsService } from "../services/payments/payments.service"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { UpdatePlanDto, updatePlanSchema } from "./dto/update-plan.dto"
import { PlansIntercerptor } from "./interceptors/plans.interceptor"
import { PlanInterceptor } from "./interceptors/plan.interceptor"
import { PolicyPlanGuard } from "./guard/policy-plan.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { Plan } from "./entities/plan.entity"

@Controller("plans")
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private paymentService: PaymentsService
  ) {}

  @UseGuards(PolicyPlanGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Plan))
  @UseInterceptors(PlanInterceptor)
  @Post()
  async create(@Body(new JoiValidationPipe(createPlanSchema)) createPlanDto: CreatePlanDto) {
    const payment = await this.paymentService.createPaymentPlan({
      amount: createPlanDto.amount,
      interval: createPlanDto.interval,
      name: createPlanDto.name
    })
    createPlanDto.planCode = payment.planCode
    return await this.plansService.create(createPlanDto)
  }

  @UseInterceptors(PlansIntercerptor)
  @UseGuards(PolicyPlanGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Plan))
  @Get()
  async findAll() {
    return await this.plansService.find()
  }

  @UseInterceptors(PlanInterceptor)
  @UseGuards(PolicyPlanGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Plan))
  @Get("/id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.plansService.findById(id)
  }

  @UseGuards(PolicyPlanGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Plan))
  @Patch("/id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body(new JoiValidationPipe(updatePlanSchema)) updatePlanDto: UpdatePlanDto) {
    const plan = await this.plansService.findById(id)
    return await this.plansService.update(plan, updatePlanDto)
  }
}
