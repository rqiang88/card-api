import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { RechargesService } from './recharges.service'
import { CreateRechargeDto } from './dto/create-recharge.dto'
import { UpdateRechargeDto } from './dto/update-recharge.dto'
import { QueryRechargeDto } from './dto/query-recharge.dto'

@ApiTags('充值管理')
@ApiBearerAuth()
@Controller('recharges')
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @Post()
  @ApiOperation({ summary: '创建充值记录' })
  @ApiResponse({ status: 201, description: '充值记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createRechargeDto: CreateRechargeDto) {
    return this.rechargesService.create(createRechargeDto)
  }

  @Get()
  @ApiOperation({ summary: '获取充值记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryRechargeDto) {
    return this.rechargesService.findAll(queryDto)
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取充值统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.rechargesService.getStatistics(startDate, endDate)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取充值记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '充值记录不存在' })
  findOne(@Param('id') id: string) {
    return this.rechargesService.findOne(+id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新充值记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '充值记录不存在' })
  update(@Param('id') id: string, @Body() updateRechargeDto: UpdateRechargeDto) {
    return this.rechargesService.update(+id, updateRechargeDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除充值记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '充值记录不存在' })
  remove(@Param('id') id: string) {
    return this.rechargesService.remove(+id)
  }

  @Post(':id/consume-amount')
  @ApiOperation({ summary: '消费金额' })
  @ApiResponse({ status: 200, description: '消费成功' })
  @ApiResponse({ status: 400, description: '余额不足' })
  consumeAmount(
    @Param('id') id: string,
    @Body('amount') amount: number
  ) {
    return this.rechargesService.consumeAmount(+id, amount)
  }

  @Post(':id/consume-times')
  @ApiOperation({ summary: '消费次数' })
  @ApiResponse({ status: 200, description: '消费成功' })
  @ApiResponse({ status: 400, description: '次数不足' })
  consumeTimes(
    @Param('id') id: string,
    @Body('times') times?: number
  ) {
    return this.rechargesService.consumeTimes(+id, times)
  }
}
