import { IsOptional, IsString, IsNumber, Min, MaxLength, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryConsumptionDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10

  @ApiProperty({ description: '搜索关键词(客户姓名或手机号)', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: '会员ID筛选', required: false, type: 'integer' })
  @IsNumber({}, { message: '会员ID必须是整数' })
  @IsOptional()
  @Type(() => Number)
  memberId?: number

  @ApiProperty({ description: '套餐ID筛选', required: false, type: 'integer' })
  @IsNumber({}, { message: '套餐ID必须是整数' })
  @IsOptional()
  @Type(() => Number)
  packageId?: number

  @ApiProperty({ description: '充值记录ID筛选', required: false, type: 'integer' })
  @IsNumber({}, { message: '充值记录ID必须是整数' })
  @IsOptional()
  @Type(() => Number)
  rechargeId?: number

  @ApiProperty({ description: '支付方式筛选', required: false })
  @IsString()
  @IsOptional()
  paymentType?: string

  @ApiProperty({ description: '状态筛选', required: false })
  @IsString()
  @IsOptional()
  state?: string

  @ApiProperty({ description: '操作员ID筛选', required: false, type: 'integer' })
  @IsNumber({}, { message: '操作员ID必须是整数' })
  @IsOptional()
  @Type(() => Number)
  operatorId?: number

  @ApiProperty({ description: '消费开始时间', required: false, type: 'string', format: 'date-time' })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiProperty({ description: '消费结束时间', required: false, type: 'string', format: 'date-time' })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiProperty({ description: '最小金额', required: false, type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAmount?: number

  @ApiProperty({ description: '最大金额', required: false, type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxAmount?: number

  @ApiProperty({ description: '排序字段', required: false, enum: ['amount', 'consumptionAt', 'customerName'] })
  @IsString()
  @IsOptional()
  sortBy?: string

  @ApiProperty({ description: '排序方向', required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC'
}
