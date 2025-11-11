import { PartialType } from "@nestjs/mapped-types"
import { CreateCommisionDto } from "./create-commision.dto"

export class UpdateCommisionDto extends PartialType(CreateCommisionDto) {}
