import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Package } from './package.entity';
import { User } from './user.entity';
import { Consumption } from './consumption.entity';

@Entity('recharges')
export class Recharge extends BaseEntity {
  @Column({ type: 'bigint', nullable: true, comment: '会员ID' })
  memberId: number;

  @Column({
    type: 'bigint',
    nullable: true,
    comment: '套餐ID(可为空，纯余额充值)'
  })
  packageId: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
    comment: '充值金额'
  })
  rechargeAmount: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
    default: 0,
    comment: '赠送金额'
  })
  bonusAmount: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
    comment: '总金额(充值+赠送)'
  })
  totalAmount: number;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    comment: '总次数(套餐充值)'
  })
  totalTimes: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '已使用次数' })
  usedTimes: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '剩余次数' })
  remainingTimes: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
    comment: '剩余金额'
  })
  remainingAmount: number;

  @Column({ type: 'date', nullable: true, comment: '有效期开始时间' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, comment: '有效期结束时间' })
  endDate: Date;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '充值类型' })
  type: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '套餐名称' })
  packageName: string;

  @Column({ type: 'int', nullable: true, comment: '有效天数' })
  validityDays: number;

  @Column({ comment: '支付方式', nullable: true })
  paymentType: string;

  @Column({ length: 100, nullable: true, comment: '交易流水号' })
  seq: string;

  @Column({ nullable: true, comment: '状态' })
  state: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '充值时间'
  })
  rechargeAt: Date;

  @Column({ type: 'bigint', nullable: true, comment: '操作员ID' })
  operatorId: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'json', nullable: true, comment: '其他字段' })
  payload: object;

  // 关联关系
  @ManyToOne(() => Member, member => member.rechargeRecords)
  member: Member;

  @ManyToOne(() => Package, pkg => pkg.rechargeRecords)
  package: Package;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @OneToMany(() => Consumption, consumption => consumption.recharge)
  consumptionRecords: Consumption[];

  // TypeORM 回调方法
  @BeforeInsert()
  setDefaultValues() {
    if (!this.state) {
      this.state = 'valid';
    }
    if (!this.rechargeAt) {
      this.rechargeAt = new Date();
    }
    if (!this.usedTimes) {
      this.usedTimes = 0;
    }
    if (this.totalTimes && !this.remainingTimes) {
      this.remainingTimes = this.totalTimes - (this.usedTimes || 0);
    }

    // 自动检查和设置状态
    this.autoUpdateState();
  }

  @BeforeUpdate()
  beforeUpdate() {
    // 更新前自动检查和设置状态
    this.autoUpdateState();
  }

  @AfterLoad()
  afterLoad() {
    // 加载后自动检查状态（用于查询时的状态同步）
    this.autoUpdateState();
  }

  /**
   * 自动更新状态逻辑
   */
  private autoUpdateState() {
    const now = new Date();

    // 如果已经是禁用状态，不进行自动更新
    if (this.state === 'disabled') {
      return;
    }

    // 检查是否过期
    if (this.endDate && this.endDate < now) {
      this.state = 'expired';
      return;
    }

    // 检查剩余次数是否为0
    if (this.remainingTimes !== null && this.remainingTimes <= 0) {
      this.state = 'completed';
      return;
    }

    // 如果以上条件都不满足，且当前状态不是active，则设置为active
    if (this.state!== 'active' && this.state !== 'disabled') {
      this.state = 'active';
    }
  }

  /**
   * 重置次数统计
   * 根据关联的消费记录重新计算已使用次数和剩余次数
   */
  resetTimesCount(): void {
    // 如果没有加载关联的消费记录，设置默认值
    if (this.consumptionRecords) {
      // 统计有效的消费记录数量（状态为已完成或进行中的记录）
      const validConsumptions = this.consumptionRecords.filter(
        consumption => consumption.state === 'valid'
      );

      // 更新已使用次数
      this.usedTimes = validConsumptions.length;
      // 更新剩余次数
      this.remainingTimes = this.totalTimes - this.usedTimes;
    }
  }

  /**
   * 检查是否还有剩余次数
   */
  hasRemainingTimes(): boolean {
    return this.remainingTimes !== null && this.remainingTimes > 0;
  }

  /**
   * 检查是否在有效期内
   */
  isInValidityPeriod(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  /**
   * 检查是否可以消费
   */
  canConsume(): boolean {
    return this.state === 'valid' && this.hasRemainingTimes();
  }
}
