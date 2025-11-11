# Utils Module

A collection of **utility services** for common backend tasks including CSV handling, date manipulation, helpers, and transactional operations.

---

## Features

* **CSV Service**: Read, write, and generate CSV files or buffers.
* **Date Service**: Flexible date/time operations, formatting, and calculations.
* **Helpers Service**: String manipulation, random number generation, OTPs, passwords, and capitalization utilities.
* **Transaction Helper**: Wrap database operations in atomic transactions with TypeORM.

---

## Installation

```bash
npm install @nestjs/common csv-parse csv-stringify csv-writer generate-password-ts
```

---

## Module Registration

```ts
import { Module } from '@nestjs/common';
import { UtilsModule } from '@/services/utils/utils.module';

@Module({
  imports: [UtilsModule],
})
export class AppModule {}
```

---

## Services

### 1. CsvService

Handles reading and writing CSV files and buffers.

#### Methods

* **`writeCsvToFile(options: CsvWriteToFileOptions)`**

  ```ts
  await csvService.writeCsvToFile({
    outputPath: './data.csv',
    headers: [{ id: 'name', title: 'Name' }, { id: 'age', title: 'Age' }],
    records: [{ name: 'John', age: 30 }]
  });
  ```

* **`writeCsvToBuffer(options: CsvWriteToBufferOptions): Promise<Buffer>`**

  ```ts
  const buffer = await csvService.writeCsvToBuffer({
    headers: [{ key: 'name', header: 'Name' }],
    records: [{ name: 'John' }]
  });
  ```

* **`readCsvFromFile(options: CsvReadFromFileOptions): Promise<CsvParsedResult>`**

  ```ts
  const result = await csvService.readCsvFromFile({ path: './data.csv' });
  console.log(result.headers); // ['Name', 'Age']
  console.log(result.records); // [{ name: 'John', age: 30 }]
  ```

---

### 2. DateService

Utility for dates and times.

#### Methods

* `addHours(numOfHours: number, date?: Date): Date`
* `addMinutes(minutes: number, date?: Date): Date`
* `getFirstAndLastDayOfMonth(date: Date): { firstDay: string, lastDay: string }`
* `getCurrentDateString(): string`
* `getPaddedCurrentDate(date?: Date): string` → returns `dd_mm_yyyy`
* `getHrMinSecPeriod(date?: Date)` → returns `{ hours, minutes, seconds, period }`
* `getDateInDayMonthYear(date?: Date)` → returns `{ day, month, year }`

**Example:**

```ts
const { firstDay, lastDay } = dateService.getFirstAndLastDayOfMonth(new Date());
console.log(firstDay, lastDay);
```

---

### 3. HelpersService

Common helper utilities.

#### Methods

* `capitalizeWords(sentence: string): string`
* `generateRandomNumber(length: number): number`
* `generatePassword(options: IPasswordGenerateOptions): string`
* `generateOtp(length: number): number`

**Example:**

```ts
const capitalized = helpersService.capitalizeWords('hello world'); // "Hello World"
const otp = helpersService.generateOtp(6); // 123456
```

---

### 4. TransactionHelper

Run database operations inside a TypeORM transaction.

#### Methods

* `runInTransaction<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T>`

**Example:**

```ts
await transactionHelper.runInTransaction(async (manager) => {
  await manager.save(UserEntity, { name: 'John' });
});
```

---

## Usage

```ts
import { Injectable } from '@nestjs/common';
import { CsvService, DateService, HelpersService, TransactionHelper } from '@/services/utils';

@Injectable()
export class ExampleService {
  constructor(
    private readonly csvService: CsvService,
    private readonly dateService: DateService,
    private readonly helpersService: HelpersService,
    private readonly transactionHelper: TransactionHelper
  ) {}

  async example() {
    const today = this.dateService.getCurrentDateString();
    const otp = this.helpersService.generateOtp(6);

    await this.csvService.writeCsvToFile({
      outputPath: `./output_${today}.csv`,
      headers: [{ id: 'otp', title: 'OTP' }],
      records: [{ otp }]
    });

    await this.transactionHelper.runInTransaction(async (manager) => {
      // transactional DB logic here
    });
  }
}
```

---

## Notes

* `CsvService` supports both file and in-memory buffer operations.
* `DateService` always returns ISO strings in UTC for consistency.
* `TransactionHelper` ensures transactions are committed or rolled back properly.
* `HelpersService` provides secure OTP and password generation.

---

# UtilsModule Quick Reference Table

| Service               | Method                      | Parameters                                                                                         | Returns                                                               | Description                              |
| --------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| **CsvService**        | `writeCsvToFile`            | `{ outputPath: string, records: Record<string, any>[], headers: { id: string, title: string }[] }` | `Promise<void>`                                                       | Write CSV file to disk                   |
|                       | `writeCsvToBuffer`          | `{ headers: { key: string, header: string }[], records: Record<string, any>[] }`                   | `Promise<Buffer>`                                                     | Generate CSV in-memory as Buffer         |
|                       | `readCsvFromFile`           | `{ path: string, parseOptions?: Options }`                                                         | `Promise<{ headers: string[], records: Record<string, any>[] }>`      | Read CSV from file and parse             |
| **DateService**       | `addHours`                  | `(numOfHours: number, date?: Date)`                                                                | `Date`                                                                | Add hours to a date                      |
|                       | `addMinutes`                | `(minutes: number, date?: Date)`                                                                   | `Date`                                                                | Add minutes to a date                    |
|                       | `getFirstAndLastDayOfMonth` | `(date: Date)`                                                                                     | `{ firstDay: string, lastDay: string }`                               | Get first/last day of month in ISO       |
|                       | `getCurrentDateString`      | `()`                                                                                               | `string`                                                              | Current date in `DD/MM/YYYY` format      |
|                       | `getPaddedCurrentDate`      | `(date?: Date)`                                                                                    | `string`                                                              | Current date in `dd_mm_yyyy` format      |
|                       | `getHrMinSecPeriod`         | `(date?: Date)`                                                                                    | `{ hours: string, minutes: string, seconds: string, period: string }` | Get 12-hour time with AM/PM              |
|                       | `getDateInDayMonthYear`     | `(date?: Date)`                                                                                    | `{ day: string, month: string, year: string }`                        | Split date into human-readable parts     |
| **HelpersService**    | `capitalizeWords`           | `(sentence: string)`                                                                               | `string`                                                              | Capitalize the first letter of each word |
|                       | `generateRandomNumber`      | `(length: number)`                                                                                 | `number`                                                              | Generate random number of given length   |
|                       | `generatePassword`          | `(options: IPasswordGenerateOptions)`                                                              | `string`                                                              | Generate random secure password          |
|                       | `generateOtp`               | `(length: number)`                                                                                 | `number`                                                              | Generate numeric OTP                     |
| **TransactionHelper** | `runInTransaction`          | `(fn: (manager: EntityManager) => Promise<T>)`                                                     | `Promise<T>`                                                          | Run DB operations inside a transaction   |

---
