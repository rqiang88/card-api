import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { BaseEntity } from './base.entity'
import { Member } from './member.entity'
import { Package } from './package.entity'
import { User } from './user.entity'
import { Recharge } from './recharge.entity'

@Entity('consumptions')
export class Consumption extends BaseEntity {

  @Column({ type: 'bigint', nullable: true, comment: '会员ID(可为空，支持非会员消费)' })
  memberId: number

  @Column({ type: 'bigint', nullable: true, comment: '套餐重置记录' })
  rechargeId: number

  @Column({ length: 100, nullable: true, comment: '客户姓名' })
  customerName: string

  @Column({ length: 20, nullable: true, comment: '客户手机号' })
  customerPhone: string

  @Column({ type: 'bigint', nullable: true, comment: '套餐ID' })
  packageId: number

  @Column({ type: 'decimal', nullable: true, default: 0, precision: 10, scale: 2, comment: '消费金额' })
  amount: number

  @Column({ nullable: true, comment: '支付方式' })
  paymentType: string

  @Column({ length: 80, nullable: true, comment: '交易流水号' })
  seq: string

  @Column({ length: 20, nullable: true, comment: '状态' })
  state: string

  @Column({ type: 'timestamp', nullable: true, comment: '消费时间' })
  consumptionAt: Date

  @Column({ type: 'bigint', nullable: true, comment: '操作员ID' })
  operatorId: number

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string

  @Column({ type: 'json', nullable: true, comment: '其他字段' })
  payload: object

  // 关联关系
  @ManyToOne(() => Member, member => member.consumptionRecords)
  member: Member

  @ManyToOne(() => Package, pkg => pkg.consumptionRecords)
  package: Package

  @ManyToOne(() => Recharge, recharge => recharge.consumptionRecords)
  recharge: Recharge

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator: User

  @BeforeInsert()
  async validateAndSetDefaults() {
    // 验证充值记录有效性
    if (this.rechargeId && this.recharge) {
      await this.validateRechargeRecord()
    }

    // 设置默认值
    if (!this.state) {
      this.state = 'valid'
    }
    if (!this.consumptionAt) {
      this.consumptionAt = new Date()
    }
  }

  /**
   * 验证关联的充值记录是否有效
   */
  private async validateRechargeRecord() {
    const recharge = this.recharge
    const now = new Date()

    // 检查充值记录是否存在
    if (!recharge) {
      throw new BadRequestException('关联的充值记录不存在')
    }

    // 检查充值记录状态
    if (recharge.state === 'disabled') {
      throw new BadRequestException('充值记录已被禁用，无法消费')
    }

    // 检查是否已过期
    if (recharge.endDate && recharge.endDate < now) {
      // 自动更新充值记录状态为过期
      recharge.state = 'expired'
      throw new BadRequestException('充值记录已过期，无法消费')
    }

    // 检查剩余次数
    if (recharge.remainingTimes !== null && recharge.remainingTimes <= 0) {
      // 自动更新充值记录状态为已完成
      recharge.state = 'completed'
      throw new BadRequestException('充值记录剩余次数不足，无法消费')
    }

    // 检查充值记录是否为有效状态
    if (recharge.state !== 'active') {
      throw new BadRequestException(`充值记录状态为 ${recharge.state}，无法消费`)
    }
  }

  // 添加一个虚拟字段来存储套餐名称
  packageName?: string

  /**
   * 检查是否可以消费
   */
  canConsume(): boolean {
    return this.state === 'valid'
  }


}
