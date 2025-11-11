import { PartialType } from "@nestjs/mapped-types"
import {
  CreateGeneralSettingDto,
  CreatePlay2winSettingDto,
  CreatePromotionSettingDto,
  CreateRevenueSettingDto,
  CreateSettingDto
} from "./create-setting.dto"
import * as joi from "joi"

export class UpdateGeneralSettingDto extends PartialType(CreateGeneralSettingDto) {}
export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
export class UpdateRevenueSettingDto extends PartialType(CreateRevenueSettingDto) {}
export class UpdatePromotionSettingDto extends PartialType(CreatePromotionSettingDto) {}
export class UpdatePlay2winSettingDto extends PartialType(CreatePlay2winSettingDto) {}

export const updateSettingSchema = joi.object({
  general: joi.object({
    emailPurchase: joi.boolean().optional(),
    emailNewsUpdates: joi.boolean().optional(),
    emailProductCreation: joi.boolean().optional(),
    emailPayout: joi.boolean().optional(),
    accountEmail: joi.string().optional(),
    alternativeEmail: joi.string().optional()
  }),
  revenue: joi.object({
    minPayoutAmount: joi.number().optional(),
    maxPayoutAmount: joi.number().optional(),
    maxWithdrawalsPerDay: joi.number().optional(),
    fulfillmentFeePercentage: joi.number().optional(),
    gasFee: joi.number().optional(),
    monthlySubscriptionFee: joi.number().optional(),
    yearlySubscriptionFee: joi.number().optional(),
    gracePeriodAfterExpiry: joi.number().optional(),
    autoExpiryNotification: joi.boolean().optional(),
    notifyUserOnApproval: joi.boolean().optional(),
    notifyOnSubscriptionExpiry: joi.boolean().optional(),
    notifyOnCommissionDeduction: joi.boolean().optional()
  }),
  promotion: joi.object({
    defaultDurationDays: joi.number().optional(),
    maxPromotionsPerDay: joi.number().optional(),
    bannerPromotion: joi.boolean().optional(),
    featuredSectionPromotion: joi.boolean().optional(),
    autoApprovePromotions: joi.boolean().optional(),
    notifyVendorOnApproval: joi.boolean().optional(),
    notifyOnNewRequest: joi.boolean().optional()
  }),
  play2win: joi.object({
    playFrequency: joi.string().optional(),
    redemptionWindowDays: joi.number().optional(),
    couponRedemptionFrequency: joi.string().optional(),
    drawCycleResetTime: joi.string().optional(),
    loginRequiredToPlay: joi.boolean().optional(),
    notifyAdminOnCouponExhaustion: joi.boolean().optional(),
    showWinnersNotification: joi.boolean().optional()
  })
})
