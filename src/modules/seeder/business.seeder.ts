import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Repository } from "typeorm"
import { faker } from "@faker-js/faker"
import { User, UserRoleEnum } from "../users/entity/user.entity"
import Business from "../business/entities/business.entity"

@Injectable()
export class BusinessSeeder implements Seeder {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async seed(): Promise<any> {
    // Fetch all users with the Vendor role
    const vendorUsers = await this.userRepository.find({
      where: { role: UserRoleEnum.Vendor },
      relations: ["business"] // Load the business relation to check if it exists
    })

    // Filter out users who already have a business
    const usersWithoutBusiness = vendorUsers.filter((user) => !user.business)

    if (usersWithoutBusiness.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No vendor users without a business found. Please seed users with Vendor role or check existing businesses.")
      return
    }

    // Generate business data for each vendor user without a business
    const businesses = usersWithoutBusiness.map((user) => ({
      type: faker.company.buzzVerb(),
      businessRegNumber: faker.string.alphanumeric(10),
      contactNumber: faker.phone.number(),
      address: faker.location.streetAddress(),
      country: faker.location.country(),
      state: faker.location.state(),
      kycVerificationType: faker.helpers.arrayElement(["NATIONAL_ID_CARD", "PASSPORT", "DRIVER_LICENSE"]),
      identificationNumber: faker.string.uuid(), // Unique identifier
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      user // Link to the vendor user
    }))

    const admin = await this.userRepository.findOne({ where: { role: UserRoleEnum.Admin } })

    if (admin) {
      // create admin business
      businesses.push({
        type: faker.company.buzzVerb(),
        businessRegNumber: faker.string.alphanumeric(10),
        contactNumber: faker.phone.number(),
        address: faker.location.streetAddress(),
        country: faker.location.country(),
        state: faker.location.state(),
        kycVerificationType: faker.helpers.arrayElement(["NATIONAL_ID_CARD", "PASSPORT", "DRIVER_LICENSE"]),
        identificationNumber: faker.string.uuid(), // Unique identifier
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        user: admin
      })
    }

    // Create and save business entities
    const businessEntities = this.businessRepository.create(businesses)
    await this.businessRepository.save(businessEntities)
  }

  async drop(): Promise<any> {
    await this.businessRepository.delete({})
  }
}
