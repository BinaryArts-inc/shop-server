import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Repository } from "typeorm"
import { faker } from "@faker-js/faker"
import { Bank } from "../banks/entities/bank.entity"
import { User } from "../users/entity/user.entity"

@Injectable()
export class BankSeeder implements Seeder {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async seed(): Promise<any> {
    // Fetch users without any associated bank accounts
    const users = await this.userRepository.find({ relations: ["bank"] })

    if (users.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No users without bank accounts found. Please seed users first.")
      return
    }
    const name = ["wema", "uba", "first bank", "providus bank", "gt bank"]
    // Generate bank data for each user
    const banks = users.map((user) => ({
      bankName: faker.helpers.arrayElement(name),
      accountNumber: faker.finance.accountNumber(10), // 10-digit unique account number
      accountName: `${user.firstName} ${user.lastName}`, // Use user's full name
      user, // Link to the user
      code: "035",
      recipientCode: "RCP_gx2wn530m0i3w3m",
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }))

    // Create and save bank entities
    const bankEntities = this.bankRepository.create(banks)
    await this.bankRepository.save(bankEntities)
  }

  async drop(): Promise<any> {
    await this.bankRepository.delete({})
  }
}
