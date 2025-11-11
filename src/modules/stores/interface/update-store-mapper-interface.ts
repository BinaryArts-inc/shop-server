import { Injectable } from "@nestjs/common"
import { UpdateStoreDto } from "../dto/update-store.dto"
import { Store } from "../entities/store.entity"

@Injectable()
export class UpdateStoreMapper {
  async prepareUpdateStoreMapper(updateStoreDto: UpdateStoreDto, store: Store): Promise<UpdateStoreDto> {
    return {
      business: updateStoreDto.business ?? store.business,
      description: updateStoreDto.description ?? store.description,
      logo: updateStoreDto.logo ?? store.logo,
      name: updateStoreDto.name ?? store.name,
      type: updateStoreDto.type ?? store.type
    }
  }
}
