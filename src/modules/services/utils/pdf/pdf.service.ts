import { Injectable } from "@nestjs/common"

@Injectable()
export class PdfService {
  addSectionHeader(doc: PDFKit.PDFDocument, title: string, yPos: number) {
    doc.fontSize(12).fillColor("#000000").text(title, 50, yPos, { continued: false })
    doc
      .fillColor("#FFFFFF")
      .roundedRect(50, yPos + 15, 495, 5, 5)
      .fill()
  }

  addTwoColumnPair(
    doc: PDFKit.PDFDocument,
    key1: string,
    value1: string | undefined,
    key2: string,
    value2: string | undefined,
    yPos: number
  ): number {
    doc.fontSize(10).fillColor("#333333")
    doc.text(`${key1} ${value1 || "-"}`, 70, yPos, { continued: false })
    doc.text(`${key2} ${value2 || "-"}`, 300, yPos, { continued: false })
    return yPos + 15
  }

  checkPageBreak(doc: PDFKit.PDFDocument, currentY: number, minSpace: number): number {
    if (currentY + minSpace > doc.page.height - 50) {
      doc.addPage()
      return 50
    }
    return currentY
  }

  createTableHeader(doc: PDFKit.PDFDocument, yPos: number, columns: { text: string; width: number; x: number }[]) {
    doc.fontSize(10).fillColor("#000000")
    columns.forEach((col) => {
      doc.text(col.text, col.x, yPos, { width: col.width, underline: true, continued: false })
    })
  }

  addFooter(doc: PDFKit.PDFDocument, text: string) {
    const bottomY = doc.page.height - 50
    doc
      .strokeColor("#cccccc")
      .lineWidth(1)
      .moveTo(50, bottomY - 20)
      .lineTo(545, bottomY - 20)
      .stroke()
    doc
      .fontSize(8)
      .fillColor("#666666")
      .text(text, 50, bottomY - 15, { continued: false })
      .text(new Date().toLocaleDateString(), 0, bottomY - 15, { align: "right", width: 545, continued: false })
  }
}
