import Business from "../entities/business.entity"
import { IBusinessResponse } from "./business-response.interface"

export abstract class BusinessResponseMapper implements IInterceptor {
  transform(data: Business): IBusinessResponse {
    return {
      id: data.id,
      address: data.address,
      businessRegNumber: data.businessRegNumber,
      contactNumber: data.contactNumber,
      country: data.country,
      identificationNumber: data.identificationNumber,
      kycVerificationType: data.kycVerificationType,
      createdAt: data.createdAt,
      kycStatus: data.kycStatus,
      name: data.name,
      state: data.state,
      type: data.type,
      store: {
        id: data.store?.id,
        name: data.store?.name
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
        firstName: data.user?.firstName,
        lastName: data.user?.lastName
      }
    }
  }
}
