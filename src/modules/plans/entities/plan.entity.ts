import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm"
import { PlanInterval } from "../interface/plan-interval.interface"
import { PLAN_INTERVAL } from "../enums/plan-interval.enum"

@Entity()
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  planCode: string

  @Column({ type: "enum", enum: PLAN_INTERVAL })
  interval: PlanInterval

  @Column()
  name: string

  @Column({ type: "int" })
  amount: number

  @Column({ type: "int", nullable: true })
  savingPercentage: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
