import { FindOptionsOrder, FindOptionsRelations, FindOptionsWhere } from "typeorm"

export interface QueryOptions<T> {
  where?: FindOptionsWhere<T>
  order?: FindOptionsOrder<T>
  relations?: FindOptionsRelations<T>
}
