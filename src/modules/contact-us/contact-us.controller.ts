import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, UseInterceptors, UseGuards } from "@nestjs/common"
import { ContactUsService } from "./contact-us.service"
import { createContactUsSchema, CreateContactUsDto } from "./dto/create-contact-us.dto"
import { Public } from "../auth/decorators/public.decorator"
import { ContactsUsResponseInterceptor } from "./interceptor/contacts-us.interceptor"
import { ContactUsResponseInterceptor } from "./interceptor/contact-us.interceptor"
import { PolicyContactUsGuard } from "./guard/policy-contact-us.guard"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { JoiValidationPipe } from "@/validations/joi.validation"

@Controller("contact-us")
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Public()
  @UseInterceptors(ContactUsResponseInterceptor)
  @Post()
  create(@Body(new JoiValidationPipe(createContactUsSchema)) createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto)
  }

  @UseGuards(PolicyContactUsGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "CONTACT-US"))
  @UseInterceptors(ContactsUsResponseInterceptor)
  @Get()
  findAll() {
    return this.contactUsService.find()
  }

  @UseGuards(PolicyContactUsGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "CONTACT-US"))
  @UseInterceptors(ContactUsResponseInterceptor)
  @Get(":id")
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.contactUsService.findById(id)
  }

  @UseGuards(PolicyContactUsGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "CONTACT-US"))
  @Delete(":id")
  remove(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.contactUsService.remove({ id })
  }
}
