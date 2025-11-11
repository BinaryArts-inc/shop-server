import { FindOptionsWhere } from "typeorm"
import { Notification } from "../entities/notification.entity"

export type IQueryFilter = FindOptionsWhere<Notification>
