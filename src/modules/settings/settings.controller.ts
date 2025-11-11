import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { SettingsService } from "./settings.service"
import { CreateSettingDto, createSettingSchema } from "./dto/create-setting.dto"
import { UpdateSettingDto } from "./dto/update-setting.dto"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { SettingInterceptor } from "./interceptor/setting.interceptor"
import { PolicySettingsGuard } from "./guard/policy-settings.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { Setting } from "./entities/setting.entity"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { GeneralSettingService } from "./general-settings.service"
import { Play2winSettingService } from "./play2winSetting.service"
import { RevenueSettingService } from "./revenueSetting.service"
import { PromotionSettingService } from "./promotionSetting.service"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"

@Controller("settings")
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly generalSettingService: GeneralSettingService,
    private readonly play2winSettingService: Play2winSettingService,
    private readonly revenueSettingService: RevenueSettingService,
    private readonly promotionSettingService: PromotionSettingService,
    private readonly transactionHelper: TransactionHelper
  ) {}

  @UseInterceptors(SettingInterceptor)
  @UseGuards(PolicySettingsGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, Setting))
  @Post()
  async create(
    @Body(new JoiValidationPipe(createSettingSchema)) { generalSetting, play2winSetting, promotionSetting, revenueSetting }: CreateSettingDto
  ) {
    return await this.transactionHelper.runInTransaction(async (manager) => {
      const setting = await this.settingsService.create({}, manager)
      await this.generalSettingService.create({ ...generalSetting, setting, settingId: setting.id }, manager)
      await this.play2winSettingService.create({ ...play2winSetting, setting, settingId: setting.id }, manager)
      await this.revenueSettingService.create({ ...revenueSetting, setting, settingId: setting.id }, manager)
      await this.promotionSettingService.create({ ...promotionSetting, setting, settingId: setting.id }, manager)

      return await this.settingsService.findById(setting.id)
    })
  }

  @UseGuards(PolicySettingsGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Setting))
  @UseInterceptors(SettingInterceptor)
  @Get("")
  async findOnesettings() {
    const settings = await this.settingsService.findOneSetting()
    if (!settings) throw new NotFoundException("settings not found")
    return settings
  }

  @UseGuards(PolicySettingsGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, Setting))
  @UseInterceptors(SettingInterceptor)
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.settingsService.findOne({ id })
  }

  @UseGuards(PolicySettingsGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, Setting))
  @UseInterceptors(SettingInterceptor)
  @Patch(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSettingDto) {
    const setting = await this.settingsService.findById(id)
    return await this.settingsService.update(setting, dto)
  }

  @UseGuards(PolicySettingsGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, Setting))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.settingsService.remove({ id })
  }
}
