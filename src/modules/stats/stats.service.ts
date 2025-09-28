import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Recharge } from '@/entities/recharge.entity'
import { Member } from '@/entities/member.entity'
import { StatsQueryDto } from './dto/stats-query.dto'

export interface RechargeStatsResult {
  totalAmount: number
  totalCount: number
  period: string
  startDate: string
  endDate: string
}

export interface MemberStatsResult {
  totalCount: number
  newCount: number
  period: string
  startDate: string
  endDate: string
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 获取充值统计数据
   */
  async getRechargeStats(query: StatsQueryDto): Promise<RechargeStatsResult> {
    const { startDate, endDate } = this.getDateRange(query)

    const result = await this.rechargeRepository
      .createQueryBuilder('recharge')
      .select([
        'SUM(recharge.rechargeAmount) as totalAmount',
        'COUNT(recharge.id) as totalCount'
      ])
      .where('recharge.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .andWhere('recharge.state != :state', { state: 'disabled' })
      .getRawOne()

    return {
      totalAmount: parseFloat(result.totalAmount) || 0,
      totalCount: parseInt(result.totalCount) || 0,
      period: query.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  /**
   * 获取会员统计数据
   */
  async getMemberStats(query: StatsQueryDto): Promise<MemberStatsResult> {
    const { startDate, endDate } = this.getDateRange(query)

    // 获取总会员数
    const totalCount = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.createdAt <= :endDate', { endDate })
      .andWhere('member.state = :state', { state: 'active' })
      .getCount()

    // 获取新增会员数
    const newCount = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .andWhere('member.state = :state', { state: 'active' })
      .getCount()

    return {
      totalCount,
      newCount,
      period: query.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  /**
   * 根据查询参数获取日期范围
   */
  private getDateRange(query: StatsQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (query.period === 'custom' && query.startDate && query.endDate) {
      startDate = new Date(query.startDate)
      endDate = new Date(query.endDate)
      endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    } else {
      switch (query.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
          break
        case 'week':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay()) // 本周开始（周日）
          weekStart.setHours(0, 0, 0, 0)
          startDate = weekStart
          endDate = new Date(weekStart)
          endDate.setDate(weekStart.getDate() + 6)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      }
    }

    return { startDate, endDate }
  }
}