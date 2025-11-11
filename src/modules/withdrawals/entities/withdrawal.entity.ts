import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

import { Bank } from "@/modules/banks/entities/bank.entity"
import { Payout } from "@/modules/payouts/entities/payout.entity"
import { WITHDRAWAL_STATUS } from "../enums/withdrawal-status.enum"
import { WithdrawalStatus } from "../interfaces/withdraw-status.interface"
import { User } from "@/modules/users/entity/user.entity"

@Entity()
export class Withdrawal {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("float")
  amount: number

  @Column("float")
  currentWalletBalance: number // snapshot of wallet balance before withdrawal was initiated

  @Column()
  bankId: string

  @Column({ nullable: true })
  processedById: string

  @Column({ type: "enum", enum: WITHDRAWAL_STATUS, default: "pending" })
  status: WithdrawalStatus

  @ManyToOne(() => Bank, { eager: true })
  bank: Bank

  @ManyToOne(() => User, { eager: true, nullable: true })
  processedBy: User

  @ManyToOne(() => Payout, (payout) => payout.withdrawals)
  @JoinColumn()
  payout: Payout

  @CreateDateColumn()
  createdAt: Date

  @Column({ nullable: true })
  dateApproved: Date
}
