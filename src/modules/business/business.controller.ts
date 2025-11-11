import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common"
import { BusinessService } from "./business.service"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateBusinessDto, createBusinessSchema } from "./dto/create-business-dto"
import { Request } from "express"
import { IBusinessQuery } from "./interface/businesses-query.interface"
import { UpdateBusinessDto, updateBusinessSchema } from "./dto/update-business-dto"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import Business from "./entities/business.entity"
import { BusinessInterceptor } from "./interceptor/business.interceptor"
import { BusinessesInterceptor } from "./interceptor/businesses.interceptor"
import { PoliciesGuard } from "../auth/guard/policies-handler.guard"

@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Business))
  @UseInterceptors(BusinessInterceptor)
  @Post("/")
  async create(@Body(new JoiValidationPipe(createBusinessSchema)) createBusiness: CreateBusinessDto, @Req() req: Request) {
    const user = req.user

    createBusiness.user = user

    return await this.businessService.create(createBusiness)
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Business))
  @UseInterceptors(BusinessesInterceptor)
  @Get("/")
  async findAll(@Query() query: IBusinessQuery) {
    return await this.businessService.find(query)
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Business))
  @UseInterceptors(BusinessInterceptor)
  @Get("/user")
  async findUserBusiness(@Req() req: Request) {
    const user = req.user

    const business = await this.businessService.findOne({ user: { id: user.id } })

    return business
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Business))
  @UseInterceptors(BusinessInterceptor)
  @Get("/:id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const business = await this.businessService.findOne({ id })

    if (!business) throw new NotFoundException("Business does not exist")

    return business
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Business))
  @UseInterceptors(BusinessInterceptor)
  @Patch("/:id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body(new JoiValidationPipe(updateBusinessSchema)) updateBusiness: UpdateBusinessDto) {
    const business = await this.businessService.findOne({ id })

    if (!business) throw new NotFoundException("Business does not exist")

    return await this.businessService.update(business, updateBusiness)
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Business))
  @Delete("/:id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return await this.businessService.remove({ id })
  }
}
