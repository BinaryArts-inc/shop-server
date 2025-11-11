import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from "@nestjs/common"
import { PromotionsService } from "./promotions.service"
import { CreatePromotionDto, createPromotionSchema } from "./dto/create-promotion.dto"
import { UpdatePromotionDto, updatePromotionSchema } from "./dto/update-promotion.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { PolicyPromotionGuard } from "./guard/policy-promotion.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Promotion } from "./entities/promotion.entity"
import { Action } from "../services/casl/actions/action"
import { PromotionInterceptor } from "./interceptor/promotion.interceptor"
import { PromotionsInterceptor } from "./interceptor/promotions.interceptor"

@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @UseInterceptors(PromotionInterceptor)
  @UseGuards(PolicyPromotionGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, Promotion))
  @Post()
  async create(@Body(new JoiValidationPipe(createPromotionSchema)) createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto)
  }

  @UseInterceptors(PromotionsInterceptor)
  @UseGuards(PolicyPromotionGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Promotion))
  @Get()
  async findAll() {
    return this.promotionsService.find()
  }

  @UseInterceptors(PromotionInterceptor)
  @UseGuards(PolicyPromotionGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Promotion))
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.promotionsService.findOne({ id: id })
  }

  @UseInterceptors(PromotionInterceptor)
  @UseGuards(PolicyPromotionGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, Promotion))
  @Patch(":id")
  async update(@Param("id") id: string, @Body(new JoiValidationPipe(updatePromotionSchema)) updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.promotionsService.findOne({ id: id })
    return await this.promotionsService.update(promotion, updatePromotionDto)
  }

  @UseGuards(PolicyPromotionGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, Promotion))
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.promotionsService.remove({ id: id })
  }
}
