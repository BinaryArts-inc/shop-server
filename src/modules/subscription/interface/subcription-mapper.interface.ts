import { ISubscriptionResponse, Subscribe } from "./subscription-response.interface"

export abstract class SubscriptionResponseMapper implements IInterceptor {
  transform(data: Subscribe): ISubscriptionResponse {
    return {
      id: data.id,
      vendorName: data.vendor?.business?.store?.name || "no store",
      startDate: data.startDate,
      endDate: data.endDate,
      planType: data.planType,
      status: data.status,
      payment: {
        accessCode: data.payment?.accessCode,
        authorizationUrl: data.payment?.authorizationUrl,
        reference: data.payment?.reference
      }
    }
  }
}
