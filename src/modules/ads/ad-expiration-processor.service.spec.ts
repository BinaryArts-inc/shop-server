import { Test, TestingModule } from "@nestjs/testing"
import { AdExpirationProcessorService } from "./ad-expiration-processor.service"

describe("AdExpirationProcessorService", () => {
  let service: AdExpirationProcessorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdExpirationProcessorService]
    }).compile()

    service = module.get<AdExpirationProcessorService>(AdExpirationProcessorService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
