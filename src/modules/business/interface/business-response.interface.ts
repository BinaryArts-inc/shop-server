import { KYC_ENUM_STATUS } from "../enum/kyc-status-enum"

export interface IBusinessResponse {
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
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  store: {
    id: string
    name: string
  }
}
