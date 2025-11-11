import { Injectable } from "@nestjs/common"
import { SubscriptionService } from "../subscription/subscription.service"
import { AdsService } from "../ads/ads.service"
import { CombineRevenue } from "./interface/combined-revenue.interface"
import { CommisionsService } from "../commisions/commisions.service"
import { CommisionEnum } from "../commisions/enum/commision-enum"

@Injectable()
export class RevenuesService {
  constructor(
    private subscriptionService: SubscriptionService,
    private commisionService: CommisionsService,
    private adsService: AdsService
  ) {}

  async getCombineRevenue({ startDate, endDate }: CombineRevenue) {
    const [subscriptionRevenue, adsRevenue, commisionRevenue] = await Promise.all([
      this.subscriptionService.getSubscriptionMonthlyRevenue({ startDate, endDate, isPaid: true }),
      this.adsService.getAdsMonthlyRevenue({ startDate, endDate, status: ["active", "expired"] }),
      this.commisionService.getCommisionMonthlyRevenue({ startDate, endDate, status: CommisionEnum.PAID })
    ])

    const combinedRevenue = [...subscriptionRevenue, ...adsRevenue, ...commisionRevenue]

    const result = Object.values(
      combinedRevenue.reduce(
        (acc, { year, month, total }) => {
          const key = `${year}-${month}`
          if (!acc[key]) {
            acc[key] = { year, month, total }
          } else {
            acc[key].total += total
          }
          return acc
        },
        {} as Record<string, { year: number; month: number; total: number }>
      )
    )

    return result.sort((a, b) => a.year - b.year || a.month - b.month)
  }
}
