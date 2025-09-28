import { IsString, IsOptional, IsNumber, Min, MaxLength, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateConsumptionDto {
  @ApiProperty({
    description: '会员ID(可为空，支持非会员消费)',
    required: false,
    type: 'integer'
  })
  @IsOptional()
  @IsNumber({}, { message: '会员ID必须是整数' })
  @Type(() => Number)
  memberId?: number

  @ApiProperty({ description: '客户姓名', maxLength: 100, required: false })
  @IsOptional()
  @IsString({ message: '客户姓名必须是字符串' })
  @MaxLength(100, { message: '客户姓名不能超过100个字符' })
  customerName?: string

  @ApiProperty({ description: '客户手机号', maxLength: 20, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string

  @ApiProperty({ description: '充值记录ID', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '充值记录ID必须是整数' })
  @Type(() => Number)
  rechargeId?: number

  @ApiProperty({ description: '套餐ID', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '套餐ID必须是整数' })
  @Type(() => Number)
  packageId?: number

  @ApiProperty({ description: '消费金额', type: 'number', format: 'decimal', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '消费金额必须是数字，最多2位小数' })
  @Min(0, { message: '消费金额不能为负数' })
  @Type(() => Number)
  amount?: number

  @ApiProperty({ description: '支付方式', required: false })
  @IsOptional()
  @IsString()
  paymentType?: string

  @ApiProperty({ description: '交易流水号', maxLength: 100, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  seq?: string

  @ApiProperty({ description: '状态', required: false, default: 'completed' })
  @IsOptional()
  @IsString()
  state?: string

  @ApiProperty({
    description: '消费时间',
    required: false,
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  consumptionAt?: string

  @ApiProperty({ description: '操作员ID', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '操作员ID必须是整数' })
  @Type(() => Number)
  operatorId?: number

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ description: '扩展字段', required: false, type: 'object' })
  @IsOptional()
  payload?: object
}
