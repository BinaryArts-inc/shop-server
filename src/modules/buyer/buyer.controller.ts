import { Controller, Get, Param, ParseUUIDPipe, Res, UseGuards } from "@nestjs/common"
import { PolicyBuyerProfilesGuard } from "./guard/policy-profiles.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { Response } from "express"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { UserService } from "../users/user.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { UserRoleEnum } from "../users/entity/user.entity"
import { OrdersService } from "../orders/orders.service"
import { BuyerProfile } from "./interface/buyer-profile"
import { BuyerService } from "./buyer.service"

@Controller("buyer")
export class BuyerController {
  constructor(
    private readonly buyerService: BuyerService,
    private readonly userService: UserService,
    private readonly orderService: OrdersService
  ) {}

  @UseGuards(PolicyBuyerProfilesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, "PROFILE"))
  @Get("download/:id")
  async downloadBuyerProfile(@Param("id", new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const user = await this.userService.findById(id)

    if (!user) throw new NotFoundException("User not found")

    if (user.role !== UserRoleEnum.Customer) throw new BadReqException("User is not a customer")

    const [orders, count] = await this.orderService.find({ buyerId: user.id })

    const refinedOrders = orders.flatMap((order) => {
      return order.items.map((item) => ({
        id: order.id,
        vendorName: item.product.store.name,
        dateOrdered: order.paidAt,
        totalAmount: order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        status: order.deliveryStatus
      }))
    })

    const profile: BuyerProfile = {
      profile: {
        fullName: user.getFullName(),
        email: user.email,
        dateJoined: user.createdAt,
        phoneNumber: user.phoneNumber,
        status: user.status,
        totalOrders: count
      },
      orders: refinedOrders
    }
    const pdfBuffer = await this.buyerService.generateBuyerPdf(profile)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=vendor_profile_${user.id}.pdf`)
    res.send(pdfBuffer)
  }
}
