import { Controller } from "@nestjs/common"
import { CommisionsService } from "./commisions.service"

@Controller("commisions")
export class CommisionsController {
  constructor(private readonly commisionsService: CommisionsService) {}
}
