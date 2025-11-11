import { User } from "@/modules/users/entity/user.entity"
import { IVendorResponse } from "./vendor-response.interface"

export abstract class VendorResponseMapper implements IInterceptor {
  transform(data: User): IVendorResponse {
    return {
      user: {
        id: data.id,
        fullName: data.getFullName(),
        email: data.email,
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName
      },
      business: {
        id: data.business.id,
        name: data.business.name,
        address: data.business.address,
        country: data.business.country,
        state: data.business.state,
        type: data.business.type
      },
      store: {
        id: data.business.store.id,
        description: data.business.store.description,
        name: data.business.store.name,
        logo: data.business.store.logo
      }
    }
  }
}
