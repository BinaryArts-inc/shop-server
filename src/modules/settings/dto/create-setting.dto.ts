import * as joi from "joi"
import { Setting } from "../entities/setting.entity"

export class CreateSettingDto {
  generalSetting?: CreateGeneralSettingDto
  revenueSetting?: CreateRevenueSettingDto
  promotionSetting?: CreatePromotionSettingDto
  play2winSetting?: CreatePlay2winSettingDto
}

export class CreateGeneralSettingDto {
  settingId: string
  setting: Setting
  purchaseEmailNotification: boolean
  newsAndUpdateEmailNotification: boolean
  productCreationEmailNotification: boolean
  payoutEmailNotification: boolean
  contactEmail: string
  alternativeContactEmail?: string
}

export class CreateRevenueSettingDto {
  settingId: string
  setting: Setting
  minPayoutAmount: number
  maxPayoutAmount: number
  maxWithdrawalsPerDay: number
  fulfillmentFeePercentage: number
  gasFee: number
  monthlySubscriptionFee: number
  yearlySubscriptionFee: number
  gracePeriodAfterExpiry: number
  autoExpiryNotification: boolean
  notifyUserOnApproval: boolean
  notifyOnSubscriptionExpiry: boolean
  notifyOnCommissionDeduction: boolean
}

export class CreatePromotionSettingDto {
  settingId: string
  setting: Setting
  defaultDurationDays: number
  maxPromotionsPerDay: number
  bannerPromotion: boolean
  featuredSectionPromotion: boolean
  autoApprovePromotions: boolean
  notifyVendorOnApproval: boolean
  notifyOnNewRequest: boolean
}

export class CreatePlay2winSettingDto {
  settingId: string
  setting: Setting
  playFrequency: string
  redemptionWindowDays: number
  couponRedemptionFrequency: string
  drawCycleResetTime: string
  loginRequiredToPlay: boolean
  notifyAdminOnCouponExhaustion: boolean
  showWinnersNotification: boolean
}

export const createSettingSchema = joi.object({
  generalSetting: joi.object({
    purchaseEmailNotification: joi.boolean().default(true).optional(),
    newsAndUpdateEmailNotification: joi.boolean().default(true).optional(),
    productCreationEmailNotification: joi.boolean().default(true).optional(),
    payoutEmailNotification: joi.boolean().default(true).optional(),
    contactEmail: joi.string().default("info@skishop.com").optional(),
    alternativeContactEmail: joi.string().optional()
  }),
  revenueSetting: joi.object({
    minPayoutAmount: joi.number().default(10000).optional(),
    maxPayoutAmount: joi.number().default(100000).optional(),
    maxWithdrawalsPerDay: joi.number().default(1).optional(),
    fulfillmentFeePercentage: joi.number().default(10).optional(),
    gasFee: joi.number().default(1000).optional(),
    monthlySubscriptionFee: joi.number().default(10000).optional(),
    yearlySubscriptionFee: joi.number().default(100000).optional(),
    gracePeriodAfterExpiry: joi.number().default(7).optional(),
    autoExpiryNotification: joi.boolean().default(true).optional(),
    notifyUserOnApproval: joi.boolean().default(true).optional(),
    notifyOnSubscriptionExpiry: joi.boolean().default(true).optional(),
    notifyOnCommissionDeduction: joi.boolean().default(true).optional()
  }),
  promotionSetting: joi.object({
    defaultDurationDays: joi.number().default(7).optional(),
    maxPromotionsPerDay: joi.number().default(3).optional(),
    bannerPromotion: joi.boolean().default(true).optional(),
    featuredSectionPromotion: joi.boolean().default(true).optional(),
    autoApprovePromotions: joi.boolean().default(true).optional(),
    notifyVendorOnApproval: joi.boolean().default(true).optional(),
    notifyOnNewRequest: joi.boolean().default(true).optional()
  }),
  play2winSetting: joi.object({
    playFrequency: joi.string().optional(),
    redemptionWindowDays: joi.number().default(7).optional(),
    couponRedemptionFrequency: joi.string().optional(),
    drawCycleResetTime: joi.string().optional(),
    loginRequiredToPlay: joi.boolean().default(true).optional(),
    notifyAdminOnCouponExhaustion: joi.boolean().default(true).optional(),
    showWinnersNotification: joi.boolean().default(true).optional()
  })
})
