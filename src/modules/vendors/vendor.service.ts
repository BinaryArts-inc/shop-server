import { Injectable } from "@nestjs/common"
import * as PDFDocument from "pdfkit"
import { PdfInterface } from "./interface/pdf.interface"
import { PdfService } from "../services/utils/pdf/pdf.service"

@Injectable()
export class VendorService {
  constructor(private readonly pdfService: PdfService) {}

  async generateVendorPdf(data: PdfInterface): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: `Profile`,
            Author: "Skicom Management System",
            Subject: "Skicom Profile Document",
            Creator: "Skicom Profile Service"
          }
        })

        // Set the entire page background to white
        doc.fillColor("#FFFFFF").rect(0, 0, doc.page.width, doc.page.height).fill()

        const buffers: Buffer[] = []

        doc.on("data", (chunk) => buffers.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(buffers)))
        doc.on("error", (err) => reject(err))

        this.generateVendorPdfContent(doc, data)
        doc.end()
      } catch (error) {
        console.error("PDF generation error:", error)
        reject(error)
      }
    })
  }

  private generateVendorPdfContent(doc: PDFKit.PDFDocument, data: PdfInterface) {
    // Set default font
    doc.font("Helvetica")

    // Header
    doc.fillColor("#1DA1F2").opacity(0.1).roundedRect(50, 50, 495, 60, 10).fill()
    doc.opacity(1).fontSize(20).fillColor("#1DA1F2").text(`Vendor's Profile - ${data.profile.storeName}`, 50, 60, {
      align: "center"
    })

    let yPos = 130

    // ====================
    // PROFILE OVERVIEW
    // ====================
    this.pdfService.addSectionHeader(doc, "Profile Overview", yPos)
    yPos += 20
    yPos = this.pdfService.addTwoColumnPair(doc, "Store Name:", data.profile.storeName || "-", "Email Address:", data.profile.email || "-", yPos)
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Phone Number:",
      data.profile.phoneNumber || "-",
      "Date Joined:",
      data.profile.dateJoined?.toLocaleDateString() || "-",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Orders:",
      data.profile.orders?.toString() || "0",
      "KYC Status:",
      data.profile.kycStatus || "Pending",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Subscription Status:",
      data.profile.subscriptionStatus || "Inactive",
      "Last Activity:",
      data.profile.lastActivity?.toLocaleDateString() || "-",
      yPos
    )

    // Check for page break needed
    yPos = this.pdfService.checkPageBreak(doc, yPos, 100)

    // ====================
    // BUSINESS INFORMATION
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Business & KYC Information", yPos)
    doc
      .fillColor("#FFFFFF")
      .roundedRect(50, yPos + 15, 495, 80, 10)
      .fill()
    yPos += 20
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Business Name:",
      data.business.businessName || "-",
      "CAC Reg. No:",
      data.business.CacRegNo || "-",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "KYC Type:",
      data.business.kycType || "-",
      "Identification Number:",
      data.business.kycIdentificationNumber || "-",
      yPos
    )

    // Check for page break needed
    yPos = this.pdfService.checkPageBreak(doc, yPos, 100)

    // ====================
    // SUBSCRIPTION INFO
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Subscription Information", yPos)
    yPos += 20
    yPos = this.pdfService.addTwoColumnPair(doc, "Status:", data.subscription.status || "-", "Plan Type:", data.subscription.planType || "-", yPos)
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Payment Status:",
      data.subscription.paymentStatus || "-",
      "Start Date:",
      data.subscription.startDate?.toLocaleDateString() || "-",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(doc, "End Date:", data.subscription.endDate?.toLocaleDateString() || "-", "", "", yPos)

    // Check for page break needed
    yPos = this.pdfService.checkPageBreak(doc, yPos, 100)

    // ====================
    // PRODUCT & SALES
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Product & Sales Performance", yPos)
    yPos += 20
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Total Products:",
      data.product.totalProduct?.toString() || "0",
      "Published Products:",
      data.product.totalPublishedProduct?.toString() || "0",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Total Sales:",
      `${data.product.totalSales?.toFixed(2) || "0.00"}`,
      "Total Orders:",
      data.product.totalOrders?.toString() || "0",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Average Order Value:",
      `$${data.product.averageNumberOfOrder?.toFixed(2) || "0.00"}`,
      "Last Order:",
      data.product.lastOrder?.toLocaleDateString() || "-",
      yPos
    )

    // Check for page break needed
    yPos = this.pdfService.checkPageBreak(doc, yPos, 100)

    // ====================
    // PAYOUTS OVERVIEW
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Payouts Overview", yPos)
    yPos += 20
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Wallet Balance:",
      `$${data.payout.walletBalance?.toFixed(2) || "0.00"}`,
      "Total Withdrawals:",
      data.payout.totalWithdrawal?.toString() || "0",
      yPos
    )
    yPos = this.pdfService.addTwoColumnPair(
      doc,
      "Pending Withdrawals:",
      data.payout.pendingWithdrawal?.toString() || "0",
      "Last Payout:",
      data.payout.lastPayout?.toLocaleDateString() || "-",
      yPos
    )

    // Check for page break needed
    yPos = this.pdfService.checkPageBreak(doc, yPos, 150)

    // ====================
    // ORDER HISTORY
    // ====================
    yPos += 20
    this.pdfService.addSectionHeader(doc, "Order History", yPos)
    yPos += 20

    // Table Header
    doc.fontSize(10).fillColor("#000000")
    this.pdfService.createTableHeader(doc, yPos, [
      { text: "Order ID", width: 120, x: 70 },
      { text: "Date Ordered", width: 100, x: 200 },
      { text: "Buyer", width: 100, x: 310 },
      { text: "Amount", width: 80, x: 420 },
      { text: "Status", width: 60, x: 510 }
    ])
    yPos += 15

    // Table Rows
    const orders = data.orders || []
    orders.forEach((order, index) => {
      if (yPos > doc.page.height - 50) {
        doc.addPage()
        yPos = 50
        this.pdfService.createTableHeader(doc, yPos, [
          { text: "Order ID", width: 120, x: 70 },
          { text: "Date Ordered", width: 100, x: 200 },
          { text: "Buyer", width: 100, x: 310 },
          { text: "Amount", width: 80, x: 420 },
          { text: "Status", width: 60, x: 510 }
        ])
        yPos += 15
      }

      doc.fontSize(8).fillColor("#333333")
      doc.text(order.id || "-", 70, yPos, { width: 120, ellipsis: true })
      doc.text(order.dateOrdered?.toLocaleDateString() || "-", 200, yPos, { width: 100 })
      doc.text(order.buyerName || "-", 310, yPos, { width: 100, ellipsis: true })
      doc.text(`${order.totalAmount?.toFixed(2) || "0.00"}`, 420, yPos, { width: 80 })
      doc.text(order.status || "-", 510, yPos, { width: 60 })

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
