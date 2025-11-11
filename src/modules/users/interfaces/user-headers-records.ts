import { KYC_ENUM_STATUS } from "@/modules/business/enum/kyc-status-enum"

export interface HeadersRecordsInterface {
  headers: Header[]
  records: Record[]
}

type Header = {
  key: string
  header: string
}

type Record = {
  name: string
  phoneNumber: string
  emailAddress: string
  orders?: number
  kycStatus?: KYC_ENUM_STATUS
}
