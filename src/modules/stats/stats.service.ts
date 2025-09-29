import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recharge } from '@/entities/recharge.entity';
import { Member } from '@/entities/member.entity';
import { Package } from '@/entities/package.entity';
import { Consumption } from '@/entities/consumption.entity';
import { StatsQueryDto } from './dto/stats-query.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';

export interface RechargeStatsResult {
  totalAmount: number;
  totalCount: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface MemberStatsResult {
  totalCount: number;
  newCount: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface RevenueStatsResult {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  memberCount: number;
  packageCount: number;
  rechargeCount: number;
  consumptionCount: number;
}

export interface WeeklyRevenueStatsResult {
  records: Array<{
    date: string;
    revenue: number;
    dayOfWeek: string;
  }>;
  totalRevenue: number;
  startDate: string;
  endDate: string;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Recharge)
    private readonly rechargeRepository: Repository<Recharge>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Consumption)
    private readonly consumptionRepository: Repository<Consumption>
  ) {}

  /**
   * 获取充值统计数据
   */
  async getRechargeStats(query: StatsQueryDto): Promise<RechargeStatsResult> {
    const { startDate, endDate } = this.getDateRange(query);

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
      .getRawOne();

    return {
      totalAmount: parseFloat(result.totalAmount) || 0,
      totalCount: parseInt(result.totalCount) || 0,
      period: query.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * 获取会员统计数据
   */
  async getMemberStats(query: StatsQueryDto): Promise<MemberStatsResult> {
    const { startDate, endDate } = this.getDateRange(query);

    // 获取总会员数
    const totalCount = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.createdAt <= :endDate', { endDate })
      .andWhere('member.state = :state', { state: 'active' })
      .getCount();

    // 获取新增会员数
    const newCount = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .andWhere('member.state = :state', { state: 'active' })
      .getCount();

    return {
      totalCount,
      newCount,
      period: query.period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * 根据查询参数获取日期范围
   */
  private getDateRange(query: StatsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.period === 'custom' && query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
    } else {
      switch (query.period) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          );
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay()); // 本周开始（周日）
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          endDate = new Date(weekStart);
          endDate.setDate(weekStart.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
          );
      }
    }

    return { startDate, endDate };
  }

  async getRevenueStats(query: RevenueQueryDto): Promise<RevenueStatsResult> {
    try {
      const now = new Date();

      // 如果提供了时间范围，使用提供的时间；否则使用当前时间计算
      const queryStartDate = query.startDate ? new Date(query.startDate) : null;
      const queryEndDate = query.endDate ? new Date(query.endDate) : null;

      // 今日营收 - 如果有时间范围限制，则在该范围内计算今日营收
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      let todayRevenueQuery = this.rechargeRepository
        .createQueryBuilder('recharge')
        .select('SUM(recharge.rechargeAmount)', 'total')
        .where(
          'recharge.rechargeAt >= :todayStart AND recharge.rechargeAt <= :todayEnd',
          {
            todayStart,
            todayEnd
          }
        );

      // 如果有查询时间范围，添加额外的时间限制
      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          todayRevenueQuery = todayRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart AND recharge.rechargeAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          todayRevenueQuery = todayRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          todayRevenueQuery = todayRevenueQuery.andWhere(
            'recharge.rechargeAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      const todayRevenueResult = await todayRevenueQuery.getRawOne();

      // 本周营收
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      let weekRevenueQuery = this.rechargeRepository
        .createQueryBuilder('recharge')
        .select('SUM(recharge.rechargeAmount)', 'total')
        .where(
          'recharge.rechargeAt >= :weekStart AND recharge.rechargeAt <= :weekEnd',
          {
            weekStart,
            weekEnd
          }
        );

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          weekRevenueQuery = weekRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart AND recharge.rechargeAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          weekRevenueQuery = weekRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          weekRevenueQuery = weekRevenueQuery.andWhere(
            'recharge.rechargeAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      const weekRevenueResult = await weekRevenueQuery.getRawOne();

      // 本月营收
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      let monthRevenueQuery = this.rechargeRepository
        .createQueryBuilder('recharge')
        .select('SUM(recharge.rechargeAmount)', 'total')
        .where(
          'recharge.rechargeAt >= :monthStart AND recharge.rechargeAt <= :monthEnd',
          {
            monthStart,
            monthEnd
          }
        );

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          monthRevenueQuery = monthRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart AND recharge.rechargeAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          monthRevenueQuery = monthRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          monthRevenueQuery = monthRevenueQuery.andWhere(
            'recharge.rechargeAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      const monthRevenueResult = await monthRevenueQuery.getRawOne();

      // 总营收 - 如果有时间范围，则在该范围内计算；否则计算所有时间的总营收
      let totalRevenueQuery = this.rechargeRepository
        .createQueryBuilder('recharge')
        .select('SUM(recharge.rechargeAmount)', 'total');

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          totalRevenueQuery = totalRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart AND recharge.rechargeAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          totalRevenueQuery = totalRevenueQuery.andWhere(
            'recharge.rechargeAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          totalRevenueQuery = totalRevenueQuery.andWhere(
            'recharge.rechargeAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      const totalRevenueResult = await totalRevenueQuery.getRawOne();

      // 基本统计数据 - 如果有时间范围，则在该范围内统计
      let memberCountQuery = this.memberRepository.createQueryBuilder('member');
      let rechargeCountQuery =
        this.rechargeRepository.createQueryBuilder('recharge');

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          memberCountQuery = memberCountQuery.andWhere(
            'member.registerAt >= :queryStart AND member.registerAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          memberCountQuery = memberCountQuery.andWhere(
            'member.registerAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          memberCountQuery = memberCountQuery.andWhere(
            'member.registerAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          rechargeCountQuery = rechargeCountQuery.andWhere(
            'recharge.rechargeAt >= :queryStart AND recharge.rechargeAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          rechargeCountQuery = rechargeCountQuery.andWhere(
            'recharge.rechargeAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          rechargeCountQuery = rechargeCountQuery.andWhere(
            'recharge.rechargeAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      // 套餐数量查询
      let packageCountQuery =
        this.packageRepository.createQueryBuilder('package');

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          packageCountQuery = packageCountQuery.andWhere(
            'package.createdAt >= :queryStart AND package.createdAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          packageCountQuery = packageCountQuery.andWhere(
            'package.createdAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          packageCountQuery = packageCountQuery.andWhere(
            'package.createdAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      // 消费笔数查询
      let consumptionCountQuery =
        this.consumptionRepository.createQueryBuilder('consumption');

      if (queryStartDate || queryEndDate) {
        if (queryStartDate && queryEndDate) {
          consumptionCountQuery = consumptionCountQuery.andWhere(
            'consumption.consumptionAt >= :queryStart AND consumption.consumptionAt <= :queryEnd',
            {
              queryStart: queryStartDate,
              queryEnd: queryEndDate
            }
          );
        } else if (queryStartDate) {
          consumptionCountQuery = consumptionCountQuery.andWhere(
            'consumption.consumptionAt >= :queryStart',
            {
              queryStart: queryStartDate
            }
          );
        } else if (queryEndDate) {
          consumptionCountQuery = consumptionCountQuery.andWhere(
            'consumption.consumptionAt <= :queryEnd',
            {
              queryEnd: queryEndDate
            }
          );
        }
      }

      const memberCount = await memberCountQuery.getCount();
      const rechargeCount = await rechargeCountQuery.getCount();
      const packageCount = await packageCountQuery.getCount();
      const consumptionCount = await consumptionCountQuery.getCount();

      return {
        todayRevenue: parseFloat(todayRevenueResult?.total || '0'),
        weekRevenue: parseFloat(weekRevenueResult?.total || '0'),
        monthRevenue: parseFloat(monthRevenueResult?.total || '0'),
        totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
        memberCount,
        packageCount,
        rechargeCount,
        consumptionCount
      };
    } catch (error) {
      console.error('Revenue stats error:', error);
      // 如果出错，返回默认值
      return {
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        totalRevenue: 0,
        memberCount: 0,
        packageCount: 0,
        rechargeCount: 0,
        consumptionCount: 0
      };
    }
  }

  /**
   * 获取一周内营收数据（用于折线图）
   */
  async getWeeklyRevenueStats(): Promise<WeeklyRevenueStatsResult> {
    try {
      const now = new Date();

      // 计算最近7天的开始和结束日期
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // 包含今天在内的7天
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      const records = [];
      let totalRevenue = 0;

      // 生成每一天的数据
      const currentDate = new Date(startDate);
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        // 查询当天的营收数据
        const dailyRevenueResult = await this.rechargeRepository
          .createQueryBuilder('recharge')
          .select('SUM(recharge.rechargeAmount)', 'total')
          .where(
            'recharge.rechargeAt >= :dayStart AND recharge.rechargeAt <= :dayEnd',
            {
              dayStart,
              dayEnd
            }
          )
          .andWhere('recharge.state != :state', { state: 'disabled' })
          .getRawOne();

        const dailyRevenue = parseFloat(dailyRevenueResult?.total || '0');
        totalRevenue += dailyRevenue;

        records.push({
          date: currentDate.toISOString().split('T')[0],
          revenue: dailyRevenue,
          dayOfWeek: dayNames[currentDate.getDay()]
        });

        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        records,
        totalRevenue,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Weekly revenue stats error:', error);
      // 如果出错，返回默认值
      return {
        records: [],
        totalRevenue: 0,
        startDate: '',
        endDate: ''
      };
    }
  }
}
