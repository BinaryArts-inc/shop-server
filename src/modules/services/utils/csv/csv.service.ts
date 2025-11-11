import * as fs from "fs"
import { parse } from "csv-parse"
import { stringify } from "csv-stringify"
import { Injectable } from "@nestjs/common"
import { createObjectCsvWriter } from "csv-writer"

import { CsvParsedResult, CsvReadFromFileOptions, CsvWriteToBufferOptions, CsvWriteToFileOptions } from "./interfaces/options.interface"

@Injectable()
export class CsvService {
  async writeCsvToFile({ outputPath, records, headers }: CsvWriteToFileOptions) {
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: headers
    })

    await csvWriter.writeRecords(records)
  }

  async writeCsvToBuffer({ headers, records }: CsvWriteToBufferOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      stringify(records, { header: true, columns: headers }, (err, output) => {
        if (err) return reject(err)
        resolve(Buffer.from(output, "utf-8"))
      })
    })
  }

  async readCsvFromFile({ path, parseOptions }: CsvReadFromFileOptions): Promise<CsvParsedResult> {
    const headers: string[] = await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(parse({ to_line: 1 }))
        .on("data", (row) => {
          resolve(row)
        })
        .on("error", (error) => reject(error))
    })

    const records: Record<string, any>[] = await new Promise((resolve, reject) => {
      const results: Record<string, any>[] = []

      fs.createReadStream(path)
        .pipe(parse({ columns: headers, from_line: 2, ...parseOptions }))
        .on("data", (row) => results.push(row))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error))
    })

    return { headers, records }
  }
}
