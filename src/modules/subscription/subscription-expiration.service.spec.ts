import { Test, TestingModule } from "@nestjs/testing"
import { SubscriptionExpirationService } from "./subscription-expiration.service"

describe("SubscriptionExpirationService", () => {
  let service: SubscriptionExpirationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionExpirationService]
    }).compile()

    service = module.get<SubscriptionExpirationService>(SubscriptionExpirationService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
