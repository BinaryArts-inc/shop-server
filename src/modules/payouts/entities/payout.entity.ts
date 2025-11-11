import { Store } from "@/modules/stores/entities/store.entity"
import { Withdrawal } from "@/modules/withdrawals/entities/withdrawal.entity"
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Payout {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "float", default: 0 })
  total: number

  @Column({ type: "float", default: 0 })
  available: number

  @Column({ type: "float", default: 0 })
  pending: number

  @Column({ type: "float", default: 0 })
  withdrawn: number

  @Column()
  storeId: string

  @OneToOne(() => Store, (store) => store.payout, { eager: true })
  store: Store

  @OneToMany(() => Withdrawal, (wi) => wi.payout, { eager: true })
  withdrawals: Withdrawal[]

  handleWithdaw(amount: number) {
    const available = parseFloat(this.available.toString()) - parseFloat(amount.toString())
    const withdrawn = parseFloat(this.withdrawn.toString()) + parseFloat(amount.toString())
    const pending = parseFloat(this.pending.toString()) + parseFloat(amount.toString())
    return { available, withdrawn, pending }
  }

  handleWithdrawSuccess(amount: number) {
    const pending = parseFloat(this.pending.toString()) - parseFloat(amount.toString())
    return { pending }
  }

  handleWithdrawFailed(amount: number) {
    const available = parseFloat(this.available.toString()) + parseFloat(amount.toString())
    const withdrawn = parseFloat(this.withdrawn.toString()) - parseFloat(amount.toString())
    const pending = parseFloat(this.pending.toString()) - parseFloat(amount.toString())
    return { available, withdrawn, pending }
  }

  handleVendorOrder(amount: number) {
    const total = parseFloat(this.total.toString()) + parseFloat(amount.toString())
    const available = parseFloat(this.available.toString()) + parseFloat(amount.toString())
    return { total, available }
  }
}
