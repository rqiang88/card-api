import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Consumption } from './consumption.entity'
import { Recharge } from './recharge.entity'

@Entity('members')
export class Member extends BaseEntity {

  @Column({ length: 100, nullable: true, comment: '姓名' })
  name: string

  @Column({ length: 20, nullable: true, unique: true, comment: '电话' })
  phone: string

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string

  @Column({ length: 10, nullable: true, comment: '性别'})
  gender: string

  @Column({ type: 'date', nullable: true, comment: '生日' })
  birthday: Date

  @Column({ length: 10, nullable: true, comment: '等级' })
  level: string

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 2, default: 0, comment: '余额' })
  balance: number

  @Column({ type: 'int', nullable: true, default: 0, comment: '积分' })
  points: number

  @Column({ 
    type: 'enum', 
    enum: ['active', 'disabled'], 
    default: 'active', 
    comment: '状态: active-活跃, disabled-禁用' 
  })
  state: 'active' | 'disabled'

  @Column({ type: 'json', nullable: true, comment: '头像' })
  avatar: object

  @Column({ type: 'timestamp', nullable: true, comment: '会员登记时间' })
  registerAt: Date

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string

  @Column({ type: 'json', nullable: true, comment: '其他字段' })
  payload: object

  // 关联关系
  @OneToMany(() => Consumption, consumption => consumption.member)
  consumptionRecords: Consumption[]

  @OneToMany(() => Recharge, recharge => recharge.member)
  rechargeRecords: Recharge[]
}
