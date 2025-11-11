import { Subscription, SubscriptionEnum } from "../entities/subscription.entity"

export interface ISubscriptionResponse {
  id: string
  vendorName: string
  planType: string
  startDate: Date
  endDate: Date
  status: SubscriptionEnum
  payment?: {
    authorizationUrl: string
    accessCode: string
    reference: string
  }
}

export interface Subscribe extends Subscription {
  payment?: {
    authorizationUrl: string
    accessCode: string
    reference: string
  }
}
