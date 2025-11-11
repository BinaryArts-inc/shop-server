import { Controller, Get, Param, ParseUUIDPipe, Query, Res, UseGuards } from "@nestjs/common"
import { SubscriptionService } from "../subscription/subscription.service"
import { OrdersService } from "../orders/orders.service"
import { IRevenueQuery } from "./interface/query.interface"
import { PolicyRevenueGuard } from "./guard/policy-revenue.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { AdsService } from "../ads/ads.service"
import { StoreService } from "../stores/store.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { RevenuesService } from "./revenues.service"
import { Response } from "express"
import { CsvService } from "../services/utils/csv/csv.service"
import { CommisionsService } from "../commisions/commisions.service"
import { CommisionEnum } from "../commisions/enum/commision-enum"
import { Subscription } from "../subscription/entities/subscription.entity"

@Controller("revenues")
export class RevenuesController {
  constructor(
    private subscriptionService: SubscriptionService,
    private adsService: AdsService,
    private ordersService: OrdersService,
    private storeService: StoreService,
    private revenueService: RevenuesService,
    private readonly csvService: CsvService,
    private readonly commisionService: CommisionsService
  ) {}

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "REVENUE"))
  @Get("")
  async totalRevenue(@Query() query: IRevenueQuery) {
    let startDate: Date
    let endDate: Date

    if (query.startDate) {
      startDate = query.startDate
    }

    if (query.endDate) {
      endDate = query.endDate
    }

    const totalCommisions = await this.commisionService.calculateAdsTotalRevenue({ startDate, endDate, status: CommisionEnum.PAID })

    const totalPromotionAds = await this.adsService.calculateAdsTotalRevenue({ startDate, endDate, status: ["active", "expired"] })

    const totalSubcriptionAmount = await this.subscriptionService.calculateSubscriptionsTotalRevenue({ startDate, endDate, isPaid: true })

    const totalRevenue = totalSubcriptionAmount + totalPromotionAds + totalCommisions

    return {
      commisions: totalCommisions ?? 0,
      subscriptions: totalSubcriptionAmount ?? 0,
      promotionAds: totalPromotionAds ?? 0,
      totalRevenue
    }
  }

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "REVENUE"))
  @Get("/sales")
  async salesOverview(@Query() query: IRevenueQuery) {
    return await this.ordersService.getOrderMonthlyRevenue({ startDate: query.startDate, endDate: query.endDate, status: "paid" })
  }

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, "REVENUE"))
  @Get("/stores/:storeId")
  async getStoreRevenueMetrics(@Param("storeId", ParseUUIDPipe) storeId: string) {
    const store = await this.storeService.findById(storeId)
    if (!store) throw new NotFoundException("Store does not exist")

    return await this.ordersService.getStoreRevenueMetrics(storeId)
  }

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "REVENUE"))
  @Get("/trend")
  async getRevenueTrend(@Query() query: IRevenueQuery) {
    const startDate = query.startDate
    const endDate = query.endDate
    return await this.revenueService.getCombineRevenue({ startDate, endDate })
  }

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "REVENUE"))
  @Get("history")
  async revenueHistory(@Query() query: IRevenueQuery) {
    const startDate = query.startDate
    const endDate = query.endDate

    const [[subscriptions], [ads], [commisions]] = await Promise.all([
      this.subscriptionService.find({ isPaid: true, startDate, endDate }),
      this.adsService.find({ adStatus: ["active", "expired"], startDate, endDate }),
      this.commisionService.find({ startDate, endDate })
    ])

    const subscription = subscriptions.map((subscription: Subscription) => {
      return {
        id: subscription.id,
        revenueSource: "Subscription",
        description: subscription.planType,
        amount: subscription.amount,
        user: subscription.vendor.business.store.name,
        role: subscription.vendor.role,
        date: subscription.createdAt
      }
    })

    const ad = ads.map((ad) => {
      return {
        id: ad.id,
        revenueSource: "Ads",
        description: ad.promotion.type,
        amount: ad.amount,
        user: ad.product.store.name,
        role: ad.product.user.role,
        date: ad.createdAt
      }
    })

    const commision = commisions.map((commision) => {
      return {
        id: commision.id,
        revenueSource: "Commisions",
        description: "",
        amount: commision.amount,
        user: commision.store.name,
        role: commision.store.business.user.getFullName,
        date: commision.createdAt
      }
    })

    const revenue = [...subscription, ...ad, ...commision]

    return revenue.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  @UseGuards(PolicyRevenueGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "REVENUE"))
  @Get("download")
  async downloads(@Res() res: Response, @Query() query: IRevenueQuery) {
    const isPaid = query.flag === "paid"

    const [[subscriptions], [ads], [commisions]] = await Promise.all([
      this.subscriptionService.find({ isPaid }),
      this.adsService.find({ status: query.adsStatus }),
      this.commisionService.find({})
    ])

    const headers = [
      { key: "revenueSource", header: "Revenue Source" },
      { key: "description", header: "Description" },
      { key: "amount", header: "Amount" },
      { key: "user", header: "User" },
      { key: "role", header: "Role" },
      { key: "date", header: "Date" }
    ]

    const subscriptionsRecord = subscriptions.map((sub) => {
      return {
        revenueSource: "Subscription",
        description: sub.planType,
        amount: sub.amount,
        user: sub.vendor.getFullName(),
        role: sub.vendor.role,
        date: sub.createdAt.toISOString()
      }
    })

    const adsRecord = ads.map((ad) => {
      return {
        revenueSource: "Ads",
        description: ad.promotion.name,
        amount: ad.amount,
        user: ad.product.store.business.user.getFullName(),
        date: ad.createdAt.toISOString()
      }
    })

    const commisionRecord = commisions.map((commision) => {
      return {
        revenueSource: "Commision",
        description: commision.value,
        amount: commision.amount,
        user: commision.store.name,
        date: commision.createdAt
      }
    })

    const records = [...subscriptionsRecord, ...adsRecord, ...commisionRecord]

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=revenue.csv")
    res.send(data)
  }
}
