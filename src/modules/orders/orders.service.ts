import { Injectable } from "@nestjs/common"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderDto } from "./dto/update-order.dto"
import { Order } from "./entities/order.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { IOrdersQuery } from "./interfaces/query-filter.interface"
import { OrderRevenueInterface } from "./interfaces/order-revenue.interface"
import { MonthlySalesData, MonthlySalesQuery } from "./interfaces/order-monthlystats.interface"
import { StoreOrderRevenueSummary } from "./interfaces/store-order.interface"
import { months } from "../common/types"
import * as PDFDocument from "pdfkit"
import { PdfService } from "../services/utils/pdf/pdf.service"
import { OrderSummaryData } from "./interfaces/order-summary.interface"

@Injectable()
export class OrdersService implements IService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly pdfService: PdfService
  ) {}

  async create(data: CreateOrderDto, manager?: EntityManager): Promise<Order> {
    const repo = manager ? manager.getRepository(Order) : this.orderRepository
    const order = repo.create(data)
    return await repo.save(order)
  }

  async find({
    page = 1,
    limit = 10,
    buyerId,
    deliveryStatus,
    status,
    storeId,
    productId,
    orderBy = "ASC",
    startDate,
    endDate,
    search
  }: IOrdersQuery): Promise<[Order[], number]> {
    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.buyer", "buyer")
      .leftJoinAndSelect("order.items", "item")
      .leftJoinAndSelect("item.product", "product")
      .leftJoinAndSelect("product.user", "vendor")
      .leftJoinAndSelect("product.store", "store")
      .orderBy("order.createdAt", orderBy)

    if (buyerId) {
      query.andWhere("order.buyerId = :buyerId", { buyerId })
    }

    if (deliveryStatus) {
      query.andWhere("order.deliveryStatus = :deliveryStatus", { deliveryStatus })
    }

    if (status) {
      query.andWhere("order.status = :status", { status })
    }

    if (storeId) {
      query.andWhere("item.storeId = :storeId", { storeId })
    }

    if (productId) {
      query.andWhere("item.productId = :productId", { productId })
    }

    if (startDate && endDate) {
      query.andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate
      })
    }

    if (startDate) {
      query.andWhere("order.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("order.createdAt <= :endDate", { endDate })
    }

    if (search) {
      query.andWhere("LOWER(product.name) LIKE :search", { search: `%${search.toLowerCase()}%` })
    }

    query.skip((page - 1) * limit).take(limit)

    return await query.getManyAndCount()
  }

  async findById(id: string): Promise<Order> {
    return await this.orderRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<Order> & { storeId?: string }): Promise<Order> {
    const { storeId, ...orderFilter } = filter

    const order = await this.orderRepository.findOne({
      where: orderFilter,
      relations: ["items"]
    })

    if (!order) return null

    const items = storeId ? order.items.filter((item) => item.storeId === storeId) : order.items

    return { ...order, items }
  }

  async exists(filter: FindOptionsWhere<Order>): Promise<boolean> {
    const count = await this.orderRepository.count({ where: filter })
    return count > 0
  }

  async update(entity: Order, data: UpdateOrderDto, manager?: EntityManager): Promise<Order> {
    const repo = manager ? manager.getRepository(Order) : this.orderRepository
    const updated = repo.merge(entity, data)
    return await repo.save(updated)
  }

  async remove(filter: FindOptionsWhere<Order>): Promise<number> {
    const result = await this.orderRepository.delete(filter)
    return result.affected ?? 0
  }

  async getOrderMonthlyRevenue({}: MonthlySalesQuery): Promise<MonthlySalesData[]> {
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .select("EXTRACT(YEAR FROM order.createdAt)::integer", "year")
      .addSelect("EXTRACT(MONTH FROM order.createdAt)::integer", "month")
      .addSelect("SUM(item.unitPrice * item.quantity)", "total")
      // .where("order.status = :status", { status })
      // .andWhere("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .groupBy("year, month")
      .orderBy("year, month", "ASC")
      .getRawMany()

    return result.map((row) => ({
      year: row.year,
      month: months[row.month],
      total: parseFloat(row.total) || 0
    }))
  }

  async calculateOrdersTotalRevenue({ startDate, endDate, status }: OrderRevenueInterface): Promise<number> {
    const query = this.orderRepository.createQueryBuilder("order").leftJoinAndSelect("order.items", "item")

    if (startDate && endDate) {
      query.andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate
      })
    }

    if (startDate) {
      query.andWhere("order.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("order.createdAt <= :endDate", { endDate })
    }

    if (status) {
      query.andWhere("order.status = :status", { status })
    }

    query.select("SUM(item.unitPrice * item.quantity)", "total")

    return (await query.getRawOne())?.total || 0
  }

  async getStoreRevenueMetrics(storeId: string): Promise<StoreOrderRevenueSummary> {
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .select("SUM(item.unitPrice * item.quantity)", "totalSales")
      .addSelect("COUNT(DISTINCT order.id)", "totalOrder")
      .addSelect("AVG(item.unitPrice * item.quantity)", "averageOrderValue")
      .where("order.status = :status AND item.storeId = :storeId", { status: "paid", storeId })
      .getRawOne()

    return {
      totalRevenue: parseFloat(result?.totalSales || 0),
      totalOrders: parseInt(result?.totalOrder || 0, 10),
      averageOrderValue: parseFloat(result?.averageOrderValue || 0)
    }
  }

  async getStoreOrders(storeId: string): Promise<
    Array<{
      id: string
      status: string
      buyerName: string
      totalAmount: number
      dateOrdered: Date
    }>
  > {
    const orders = await this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("order.buyer", "buyer")
      .where("items.storeId = :storeId", { storeId })
      .getMany()

    return orders.map((ord) => ({
      id: ord.id,
      status: ord.deliveryStatus,
      buyerName: ord.buyer.getFullName(),
      totalAmount: ord.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      dateOrdered: ord.createdAt
    }))
  }

  async generateOrderSummaryPdf(data: OrderSummaryData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: `Order Summary - ${data.order.id}`,
            Author: "Skicom Management System",
            Subject: "Skicom Order Summary Document",
            Creator: "Skicom Order Service"
          }
        })
        doc.fillColor("#FFFFFF").rect(0, 0, doc.page.width, doc.page.height).fill()

        const buffers: Buffer[] = []
        doc.on("data", (chunk) => buffers.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", (err) => reject(err))

        this.generateOrderSummaryPdfContent(doc, data)
        doc.end()
      } catch (error) {
        console.error("Order Summary PDF generation error:", error)
        reject(error)
      }
    })
  }

  async generateOrderSummaryPdfContent(doc: PDFKit.PDFDocument, data: OrderSummaryData) {
    // Set default font
    doc.font("Helvetica")

    // Header (simulating the screenshot's light blue background)
    doc.fillColor("#1DA1F2").opacity(0.1).roundedRect(50, 50, 495, 60, 10).fill()
    doc.opacity(1).fontSize(20).fillColor("#1DA1F2").text("Order Summary", 50, 60, {
      align: "center"
    })
    // Note: The "Download as PDF" button isn't rendered in PDF; it's for the web UI.

    let yPos = 130

    // ====================
    // ORDER OVERVIEW
    // ====================
    this.pdfService.addSectionHeader(doc, "Order Overview", yPos) // Use your pdfService method
    // Alternative if no pdfService: doc.fontSize(14).fillColor("#000").text("Order Overview", 50, yPos); yPos += 20;

    yPos += 20

    // Two-column layout for overview (like your buyer PDF)
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Order ID:",
      data.order.id || "-",
      "Date & Time:",
      data.order.dateTime?.toLocaleString() || "-", // e.g., "03/07/2025 - 12:50 PM"
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Total Amount:",
      `₦${data.order.totalAmount?.toLocaleString() || "0"}`, // e.g., "₦234,000"
      "Payment Status:",
      data.order.paymentStatus || "-",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Order Status:",
      data.order.orderStatus || "-",
      "", // Empty for single row if needed
      "",
      yPos
    )

    // Check for page break
    yPos = this.pdfService.checkPageBreak(doc, yPos, 100)

    // ====================
    // PRODUCTS IN THE ORDER
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Product(s) In The Order", yPos)
    yPos += 20

    // Table Header for Products
    doc.fontSize(10).fillColor("#000000")
    this.pdfService.createTableHeader(doc, yPos, [
      // Reuse your table header method
      { text: "Product Name", width: 200, x: 50 },
      { text: "Quantity", width: 60, x: 260 },
      { text: "Price", width: 80, x: 330 },
      { text: "Buyer", width: 150, x: 420 }
    ])
    yPos += 15

    // Table Rows for Products
    const products = data.products || []
    products.forEach((product, index) => {
      if (yPos > doc.page.height - 50) {
        doc.addPage()
        yPos = 50
        // Re-add table header on new page
        this.pdfService.createTableHeader(doc, yPos, [
          { text: "Product Name", width: 200, x: 50 },
          { text: "Quantity", width: 60, x: 260 },
          { text: "Price", width: 80, x: 330 },
          { text: "Buyer", width: 150, x: 420 }
        ])
        yPos += 15
      }
      doc.fontSize(8).fillColor("#333333")
      doc.text(product.name || "-", 50, yPos, { width: 200, ellipsis: true })
      doc.text(product.quantity?.toString() || "-", 260, yPos, { width: 60 })
      doc.text(`₦${product.price?.toLocaleString() || "0"}`, 330, yPos, { width: 80 }) // e.g., "₦22,000"
      doc.text(product.buyer || "-", 420, yPos, { width: 150, ellipsis: true })

      // Alternating row shading (like your buyer orders)
      if (index % 2 === 0) {
        doc
          .opacity(0.05)
          .fillColor("#1DA1F2")
          .rect(50, yPos - 5, 495, 15)
          .fill()
          .opacity(1)
      }
      yPos += 15
    })

    // Footer
    this.pdfService.addFooter(doc, "Generated by Skicom Management System")
  }
}
