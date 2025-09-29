import { Controller, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  StatsService,
  RechargeStatsResult,
  MemberStatsResult,
  RevenueStatsResult,
  WeeklyRevenueStatsResult
} from './stats.service';
import { StatsQueryDto } from './dto/stats-query.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@ApiTags('统计')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post('recharge')
  @ApiOperation({ summary: '获取充值统计数据' })
  @ApiResponse({
    status: 200,
    description: '充值统计数据',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'number', description: '总充值金额' },
        totalCount: { type: 'number', description: '总充值笔数' },
        period: { type: 'string', description: '统计周期' },
        startDate: { type: 'string', description: '开始日期' },
        endDate: { type: 'string', description: '结束日期' }
      }
    }
  })
  async getRechargeStats(
    @Body() query: StatsQueryDto
  ): Promise<RechargeStatsResult> {
    return this.statsService.getRechargeStats(query);
  }

  @Post('members')
  @ApiOperation({ summary: '获取会员统计数据' })
  @ApiResponse({
    status: 200,
    description: '会员统计数据',
    schema: {
      type: 'object',
      properties: {
        totalCount: { type: 'number', description: '总会员数' },
        newCount: { type: 'number', description: '新增会员数' },
        period: { type: 'string', description: '统计周期' },
        startDate: { type: 'string', description: '开始日期' },
        endDate: { type: 'string', description: '结束日期' }
      }
    }
  })
  async getMemberStats(
    @Body() query: StatsQueryDto
  ): Promise<MemberStatsResult> {
    return this.statsService.getMemberStats(query);
  }

  @Post('revenues')
  @ApiOperation({ summary: '获取营收统计数据' })
  @ApiResponse({
    status: 200,
    description: '营收统计数据',
    schema: {
      type: 'object',
      properties: {
        todayRevenue: { type: 'number', description: '今日营收' },
        weekRevenue: { type: 'number', description: '本周营收' },
        monthRevenue: { type: 'number', description: '本月营收' },
        totalRevenue: { type: 'number', description: '总营收' },
        memberCount: { type: 'number', description: '会员数量' },
        packageCount: { type: 'number', description: '套餐数量' },
        rechargeCount: { type: 'number', description: '充值笔数' },
        consumptionCount: { type: 'number', description: '消费笔数' }
      }
    }
  })
  async getRevenueStats(
    @Body() query: RevenueQueryDto
  ): Promise<RevenueStatsResult> {
    return this.statsService.getRevenueStats(query);
  }

  @Post('weekly/revenues')
  @ApiOperation({ summary: '获取一周内营收数据（用于折线图）' })
  @ApiResponse({
    status: 200,
    description: '一周内营收数据',
    schema: {
      type: 'object',
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', description: '日期 (YYYY-MM-DD)' },
              revenue: { type: 'number', description: '当日营收' },
              dayOfWeek: { type: 'string', description: '星期几' }
            }
          }
        },
        totalRevenue: { type: 'number', description: '一周总营收' },
        startDate: { type: 'string', description: '开始日期' },
        endDate: { type: 'string', description: '结束日期' }
      }
    }
  })
  async getWeeklyRevenueStats(): Promise<WeeklyRevenueStatsResult> {
    return this.statsService.getWeeklyRevenueStats();
  }
}
