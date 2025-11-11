import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  type: string

  @Column()
  notifiableId: string

  @Column("jsonb")
  data: any

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date
}
