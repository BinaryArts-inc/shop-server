import { PaginationParams } from "@/modules/services/pagination/interfaces/pagination-params.interface"
import { Voucher } from "../entities/voucher.entity"
import { FindOptionsWhere } from "typeorm"

export interface IVoucherQueryFilter extends PaginationParams, FindOptionsWhere<Voucher> {}
