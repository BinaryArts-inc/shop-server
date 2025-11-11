import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { RevenueSetting } from "./revenueSetting.entity"
import { PromotionSetting } from "./promotionSetting.entity"
import { Play2winSetting } from "./play2winSetting.entity"
import { GeneralSetting } from "./general.entity"

@Entity()
export class Setting {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => GeneralSetting, (generalSetting) => generalSetting.setting, { eager: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  generalSetting: GeneralSetting

  @OneToOne(() => RevenueSetting, (revenueSetting) => revenueSetting.setting, { eager: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  revenueSetting: RevenueSetting

  @OneToOne(() => PromotionSetting, (promotionSetting) => promotionSetting.setting, { eager: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  promotionSetting: PromotionSetting

  @OneToOne(() => Play2winSetting, (play2winSetting) => play2winSetting.setting, { eager: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  play2winSetting: Play2winSetting

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
