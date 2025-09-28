import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { StatsService, RechargeStatsResult, MemberStatsResult } from './stats.service'
import { StatsQueryDto } from './dto/stats-query.dto'

@ApiTags('统计')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('recharge')
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
  async getRechargeStats(@Query() query: StatsQueryDto): Promise<RechargeStatsResult> {
    return this.statsService.getRechargeStats(query)
  }

  @Get('member')
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
  async getMemberStats(@Query() query: StatsQueryDto): Promise<MemberStatsResult> {
    return this.statsService.getMemberStats(query)
  }
}