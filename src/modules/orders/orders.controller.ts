import { Controller, Get, Param, ParseUUIDPipe, Query, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { IOrdersQuery } from "./interfaces/query-filter.interface"
import { OrdersInterceptor } from "./interceptors/orders.interceptor"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { OrderInterceptor } from "./interceptors/order.interceptor"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { PolicyOrderGuard } from "./guard/policy-order.guard"
import { Action } from "../services/casl/actions/action"
import { Order } from "./entities/order.entity"
import { Request } from "express"
import { FindOptionsWhere } from "typeorm"
import { UserRoleEnum } from "../users/entity/user.entity"
import { Response } from "express"
import { CsvService } from "../services/utils/csv/csv.service"
import { OrderSummaryData } from "./interfaces/order-summary.interface"

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly csvService: CsvService
  ) {}

  @UseGuards(PolicyOrderGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Order))
  @UseInterceptors(OrdersInterceptor)
  @Get("/")
  findAll(@Query() query: IOrdersQuery, @Req() req: Request) {
    const user = req.user
    if (user.role === UserRoleEnum.Customer) {
      query.buyerId = user.id
    } else if (user.role === UserRoleEnum.Vendor) {
      query.storeId = user.business?.store?.id
    }
    return this.ordersService.find(query)
  }

  @UseGuards(PolicyOrderGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Order))
  @Get("download")
  async downloads(@Query() query: IOrdersQuery, @Res() res: Response) {
    const [orders] = await this.ordersService.find(query)

    const headers = [
      { key: "product", header: "Product" },
      { key: "orderId", header: "Order ID" },
      { key: "amount", header: "Amount" },
      { key: "customerName", header: "Customer Name" },
      { key: "dateAndTime", header: "Date and Time" },
      { key: "status", header: "Status" }
    ]

    const records = orders.flatMap((order) => {
      return order.items.map((item) => {
        return {
          product: item.product.name,
          orderId: order.id,
          customerName: order.buyer.getFullName(),
          status: order.deliveryStatus,
          dateAndTime: order.createdAt.toISOString(),
          amount: item.unitPrice * item.quantity
        }
      })
    })

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv")
    res.send(data)
  }

  @UseGuards(PolicyOrderGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Order))
  @Get("download/:id")
  async orderSummary(@Param("id", ParseUUIDPipe) id: string, @Res() res: Response) {
    const order = await this.ordersService.findById(id)
    if (!order) {
      throw new NotFoundException("Order does not exist")
    }

    const orderSummary: OrderSummaryData = {
      order: {
        dateTime: order.paidAt,
        id: order.id,
        orderStatus: order.deliveryStatus,
        paymentStatus: order.status,
        totalAmount: order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      },
      products: order.items.map((item) => {
        return {
          buyer: order?.buyer.getFullName(),
          name: item.product.name,
          price: item.unitPrice,
          quantity: item.quantity
        }
      })
    }

    const pdfBuffer = await this.ordersService.generateOrderSummaryPdf(orderSummary)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=order-summary.pdf")
    res.send(pdfBuffer)
  }

  @UseGuards(PolicyOrderGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Order))
  @UseInterceptors(OrderInterceptor)
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string, @Req() req: Request) {
    const filter: FindOptionsWhere<Order> & { storeId?: string } = { id }

    if (req.user.role !== UserRoleEnum.Customer) {
      filter.storeId = req.user.business.store.id
    }

    const order = this.ordersService.findOne(filter)

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    return order
  }
}
