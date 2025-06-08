import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as Crypto from "crypto"
import generator from "generate-password-ts"

@Injectable()
export class HelpersService {
  constructor(private jwtService: JwtService) {}

  capitalizeWords(sentence: string) {
    const words = sentence.split(" ")
    const capitalizedWords = words.map((word) => {
      // Ensure the word is not an empty string
      if (word.length === 0) {
        return ""
      }
      // Capitalize the first letter and keep the rest lowercase
      return word[0].toUpperCase() + word.slice(1).toLowerCase()
    })
    return capitalizedWords.join(" ")
  }

  async generateToken(payload: { email: string; id: string }, secret: string, expiresIn: string) {
    const token = await this.jwtService.signAsync(payload, { secret, expiresIn: expiresIn })
    return token
  }

  generateRandomNumber(length: number): number {
    const min = Math.pow(10, length - 1) // Minimum value for the desired length
    const max = Math.pow(10, length) - 1 // Maximum value for the desired length
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  generatePassword(options: IPasswordGenerateOptions): string {
    return generator.generate(options)
  }

  generateOtp(length: number): number {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    let otp = ""

    for (let i = 0; i < length; i++) {
      otp += numbers[Crypto.randomInt(numbers.length)]
    }

    return Number(otp)
  }
}
