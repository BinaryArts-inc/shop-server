import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Setting } from "./setting.entity"

@Entity()
export class GeneralSetting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  settingId: string

  @OneToOne(() => Setting, (setting) => setting.generalSetting)
  setting: Setting

  @Column({ default: true })
  purchaseEmailNotification: boolean

  @Column({ default: false })
  newsAndUpdateEmailNotification: boolean

  @Column({ default: true })
  productCreationEmailNotification: boolean

  @Column({ default: true })
  payoutEmailNotification: boolean

  @Column({ default: "info@skishop.com" })
  contactEmail: string

  @Column({ nullable: true })
  alternativeContactEmail: string
}
