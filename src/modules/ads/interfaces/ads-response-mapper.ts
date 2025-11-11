import { Ad } from "../entities/ad.entity"
import { IAdResponse } from "./ad-response.interface"

export abstract class AdsMapper implements IInterceptor {
  transform(data: Ad): IAdResponse {
    return {
      id: data.id,
      duration: data.duration,
      type: data.type,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      clicks: data.clicks,
      impressions: data.impressions,
      conversionRate: data.conversionRate.toFixed(1),
      product: {
        id: data.product.id,
        name: data.product.name,
        images: data.product.images
      },
      store: data.product.store.getShortFormat(),
      vendor: {
        id: data.product.user.id,
        email: data.product.user.email,
        fullName: data.product.user.getFullName()
      }
    }
  }
}
