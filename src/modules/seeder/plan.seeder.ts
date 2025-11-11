import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Seeder } from "nestjs-seeder"
import { Repository } from "typeorm"
import { Plan } from "../plans/entities/plan.entity"
import { PLAN_INTERVAL } from "../plans/enums/plan-interval.enum"

@Injectable()
export class PlanSeeder implements Seeder {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>
  ) {}

  async seed(): Promise<any> {
    const plan = {
      amount: 5000,
      name: "monthly",
      interval: PLAN_INTERVAL[2],
      planCode: "PLN_wi2o40f24oicd1a",
      savingPercentage: 17
    }

    const planEntities = this.planRepository.create(plan)
    await this.planRepository.save(planEntities)
  }

  async drop(): Promise<any> {
    await this.planRepository.delete({})
  }
}
