import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Consumption } from './consumption.entity'
import { Recharge } from './recharge.entity'

@Entity('packages')
export class Package extends BaseEntity {

  @Column({ length: 200, nullable: true })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ comment: '套餐类型', nullable: true })
  packType: string

  @Column({ comment: '分类', nullable: true })
  category: string

  @Column({ nullable: true, comment: '图标URL' })
  icon: string

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 2, default: 0 })
  memberPrice: number

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 2, default: 0 })
  salePrice: number

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 2, default: 0 })
  price: number

  @Column({ type: 'int', nullable: true, comment: '套餐使用次数', default: 0 })
  totalTimes: number

  @Column({ type: 'int', nullable: true, comment: '有效天数', default: 0 })
  validDay: number

  @Column({  comment: '状态', nullable: true })
  state: string

  @Column({ type: 'int', nullable: true, comment: '排序' })
  position: number

  @Column({ type: 'int', nullable: true, default: 0, comment: '销售数量' })
  salesCount: number

  @Column({ type: 'json', nullable: true, comment: '其他字段' })
  payload: object

  // 关联关系
  @OneToMany(() => Consumption, consumption => consumption.package)
  consumptionRecords: Consumption[]

  @OneToMany(() => Recharge, recharge => recharge.package)
  rechargeRecords: Recharge[]
}
