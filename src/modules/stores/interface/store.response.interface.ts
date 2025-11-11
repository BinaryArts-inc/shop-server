import { vendonEnumType } from "../entities/store.entity"
import { KYC_ENUM_STATUS } from "@/modules/business/enum/kyc-status-enum"

export interface StoreResponse {
  id: string
  name: string
  description: string
  logo: string
  business: {
    id: string
    type: string
    name: string
    businessRegNumber: string
    contactNumber: string
    address: string
    country: string
    state: string
    kycVerificationType: string
    identificationNumber: string
    kycStatus: KYC_ENUM_STATUS
  }
  vendor: IdName
  type: vendonEnumType
  rating: number
  createdAt: Date
  updatedAt: Date
}
