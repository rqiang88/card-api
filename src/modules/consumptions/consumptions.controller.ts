import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ConsumptionService } from './consumptions.service'
import { CreateConsumptionDto } from './dto/create-consumption.dto'
import { UpdateConsumptionDto } from './dto/update-consumption.dto'
import { QueryConsumptionDto } from './dto/query-consumption.dto'

@ApiTags('消费管理')
@ApiBearerAuth()
@Controller('consumptions')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post()
  @ApiOperation({ summary: '创建消费记录' })
  @ApiResponse({ status: 201, description: '消费记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createConsumptionDto: CreateConsumptionDto) {
    return this.consumptionService.create(createConsumptionDto)
  }

  @Get()
  @ApiOperation({ summary: '获取消费记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryConsumptionDto) {
    return this.consumptionService.findAll(queryDto)
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取消费统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.consumptionService.getStatistics(startDate, endDate)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取消费记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '消费记录不存在' })
  findOne(@Param('id') id: string) {
    return this.consumptionService.findOne(+id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新消费记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '消费记录不存在' })
  update(@Param('id') id: string, @Body() updateConsumptionDto: UpdateConsumptionDto) {
    return this.consumptionService.update(+id, updateConsumptionDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除消费记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '消费记录不存在' })
  remove(@Param('id') id: string) {
    return this.consumptionService.remove(+id)
  }

  @Post('reset-recharge-times/:rechargeId')
  @ApiOperation({ summary: '重置充值记录次数统计' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @ApiResponse({ status: 404, description: '充值记录不存在' })
  resetRechargeTimes(@Param('rechargeId') rechargeId: string) {
    return this.consumptionService.resetRechargeTimesCount(+rechargeId)
  }

  @Post('reset-all-recharge-times')
  @ApiOperation({ summary: '批量重置所有充值记录次数统计' })
  @ApiResponse({ status: 200, description: '批量重置成功' })
  resetAllRechargeTimes() {
    return this.consumptionService.resetAllRechargeTimesCount()
  }

  @Get('verify-recharge-times/:rechargeId')
  @ApiOperation({ summary: '验证充值记录次数统计是否正确' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 404, description: '充值记录不存在' })
  verifyRechargeTimes(@Param('rechargeId') rechargeId: string) {
    return this.consumptionService.verifyRechargeTimesCount(+rechargeId)
  }
}
