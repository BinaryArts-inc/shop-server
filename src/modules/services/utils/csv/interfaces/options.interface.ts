import { Options } from "csv-parse/."

export interface CsvWriteToFileOptions {
  outputPath: string
  records: Array<Record<string, any>>
  headers: Array<{ id: string; title: string }>
}

export interface CsvWriteToBufferOptions {
  records: Array<Record<string, any>>
  headers: Array<{ key: string; header: string }>
}

export interface CsvReadFromFileOptions {
  path: string
  parseOptions?: Options
}

export interface CsvParsedResult {
  headers: string[]
  records: Array<Record<string, any>>
}
