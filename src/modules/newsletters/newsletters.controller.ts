import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, Delete, UseInterceptors } from "@nestjs/common"
import { NewslettersService } from "./newsletters.service"
import { CreateNewsletterDto } from "./dto/create-newsletter.dto"
import { Public } from "../auth/decorators/public.decorator"
import { PolicyNewsletterGuard } from "./guard/policy-newsletter.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { NewsletterResponseInterceptor } from "./interceptor/newsletter.interceptor"
import { NewslettersResponseInterceptor } from "./interceptor/newsletters.interceptor"
import { BadReqException } from "@/exceptions/badRequest.exception"

@Controller("newsletters")
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Public()
  @UseInterceptors(NewsletterResponseInterceptor)
  @Post()
  async create(@Body() createNewsletterDto: CreateNewsletterDto) {
    const subscribed = await this.newslettersService.findOne({ email: createNewsletterDto.email })

    if (subscribed) throw new BadReqException("This email is already registered for this newsletter")

    return this.newslettersService.create(createNewsletterDto)
  }

  @UseGuards(PolicyNewsletterGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "NEWSLETTER"))
  @UseInterceptors(NewslettersResponseInterceptor)
  @Get()
  findAll() {
    return this.newslettersService.find()
  }

  @UseGuards(PolicyNewsletterGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "NEWSLETTER"))
  @Get(":id")
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.newslettersService.findById(id)
  }

  @Public()
  @Delete(":id")
  async remove(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.newslettersService.remove({ id })
  }
}
