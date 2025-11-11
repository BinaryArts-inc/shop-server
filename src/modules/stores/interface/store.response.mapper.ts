import { Store } from "../entities/store.entity"
import { StoreResponse } from "./store.response.interface"

export abstract class StoreResponseMapper implements IInterceptor {
  transform(data: Store): StoreResponse {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      logo: data.logo,
      business: {
        id: data.business.id,
        type: data.business.type,
        name: data.business.name,
        businessRegNumber: data.business.businessRegNumber,
        contactNumber: data.business.contactNumber,
        address: data.business.address,
        country: data.business.country,
        state: data.business.state,
        kycVerificationType: data.business.kycVerificationType,
        identificationNumber: data.business.identificationNumber,
        kycStatus: data.business.kycStatus
      },
      vendor: {
        id: data.business?.user.id,
        name: data.business?.user.getFullName()
      },
      rating: data?.totalStoreRatingSum / data?.totalStoreRatingCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updateAt,
      type: data.type
    }
  }
}
