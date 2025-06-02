import { Injectable } from "@nestjs/common"

type FirstLastDate = {
  firstDay: string
  lastDay: string
}

type DayMonthYear = {
  day: string
  month: string
  year: string
}

@Injectable()
export class DateService {
  protected monthsInYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  addHours(numOfHours: number, date = new Date()): Date {
    const newDate = new Date(date)
    newDate.setTime(newDate.getTime() + numOfHours * 60 * 60 * 1000)

    return newDate
  }

  addMinutes(minutes: number, date = new Date()) {
    return new Date(+date + 60000 * minutes)
  }

  getFirstAndLastDayOfMonth(dateString: Date): FirstLastDate {
    const date = new Date(dateString)

    date.setDate(1)
    date.setUTCHours(0, 0, 0, 0)

    const firstDay = new Date(date)
    const lastDay = new Date(date)
    lastDay.setUTCMonth(date.getUTCMonth() + 1)
    lastDay.setUTCDate(0)
    lastDay.setUTCHours(23, 59, 59, 999)

    return {
      firstDay: firstDay.toISOString(),
      lastDay: lastDay.toISOString()
    }
  }

  getCurrentDateString(): string {
    const currentDate = new Date()
    return currentDate.toLocaleDateString("en-GB")
  }

  getPaddedCurrentDate(date?: Date): string {
    const this_date = date ?? new Date()
    const day = this_date.getDate().toString().padStart(2, "0")
    const month = (this_date.getMonth() + 1).toString().padStart(2, "0")
    const year = this_date.getFullYear().toString()
    return `${day}_${month}_${year}`
  }

  getHrMinSecPeriod(date?: Date): {
    hours: string
    minutes: string
    seconds: string
    period: string
  } {
    const currentDate = date ?? new Date()

    let hours = currentDate.getHours()
    let minutes: string | number = currentDate.getMinutes()
    const seconds = currentDate.getSeconds().toString()
    const period = hours >= 12 ? "pm" : "am"

    // Convert hours to 12-hour format
    hours = hours % 12
    hours = hours || 12 // Make sure 0 is displayed as 12

    // Add leading zeros to minutes if needed
    if (minutes < 10) {
      minutes = "0" + minutes
    }

    return {
      hours: hours.toString(),
      minutes: minutes.toString(),
      seconds,
      period
    }
  }

  getDateInDayMonthYear(date?: Date): DayMonthYear {
    const currentDate = date ?? new Date()

    const paddedCurrentDate = this.getPaddedCurrentDate(currentDate)

    const values = paddedCurrentDate.split("_")

    const day = values[0]

    const month = this.monthsInYear[parseInt(values[1]) - 1]

    const year = values[2]

    return { day, month, year }
  }
}
