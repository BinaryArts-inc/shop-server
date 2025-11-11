export interface IVendorResponse {
  user: {
    id: string
    fullName: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
  }
  business: {
    id: string
    type: string
    name: string
    country: string
    state: string
    address: string
  }
  store: {
    id: string
    name: string
    description: string
    logo: string
  }
}
