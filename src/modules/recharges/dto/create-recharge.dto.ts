import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsDateString,
  IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRechargeDto {
  @ApiProperty({ description: '会员ID', type: 'integer' })
  @IsNumber({}, { message: '会员ID必须是整数' })
  @Type(() => Number)
  memberId: number;

  @ApiProperty({ description: '套餐ID', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '套餐ID必须是整数' })
  @Type(() => Number)
  packageId?: number;

  @ApiProperty({ description: '套餐名称', required: false })
  @IsString()
  @IsOptional()
  packageName?: string;

  @ApiProperty({ description: '充值金额', type: 'number', format: 'decimal' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  rechargeAmount: number;

  @ApiProperty({
    description: '赠送金额',
    type: 'number',
    format: 'decimal',
    default: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  bonusAmount?: number;

  @ApiProperty({
    description: '总金额(充值+赠送)',
    type: 'number',
    format: 'decimal'
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({
    description: '总次数(套餐充值)',
    required: false,
    type: 'integer'
  })
  @IsOptional()
  @IsNumber({}, { message: '总次数必须是整数' })
  @Min(1)
  @Type(() => Number)
  totalTimes?: number;

  @ApiProperty({
    description: '已使用次数',
    type: 'integer',
    default: 0,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '已使用次数必须是整数' })
  @Min(0)
  @Type(() => Number)
  usedTimes?: number;

  @ApiProperty({
    description: '剩余次数',
    required: false,
    type: 'integer'
  })
  @IsOptional()
  @IsNumber({}, { message: '剩余次数必须是整数' })
  @Min(0)
  @Type(() => Number)
  remainingTimes?: number;

  @ApiProperty({ description: '剩余金额', type: 'number', format: 'decimal' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  remainingAmount: number;

  @ApiProperty({
    description: '有效期开始时间',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '有效期结束时间',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '支付方式' })
  @IsOptional()
  @IsString()
  paymentType: string;

  @ApiProperty({ description: '交易流水号', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  seq: string;

  @ApiProperty({ description: '状态', required: false, default: 'active' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: '充值记录状态',
    enum: ['active', 'completed', 'expired', 'disabled'],
    default: 'active',
    required: false
  })
  @IsOptional()
  @IsEnum(['active', 'completed', 'expired', 'disabled'], {
    message: '状态必须是 active, completed, expired, disabled 中的一个'
  })
  status?: string;

  @ApiProperty({
    description: '充值时间',
    required: false,
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  rechargeAt?: string;

  @ApiProperty({ description: '操作员ID', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '操作员ID必须是整数' })
  @Type(() => Number)
  operatorId?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '充值类型', enum: ['balance', 'package'] })
  @IsOptional()
  @IsString()
  type: 'package' | 'balance';

  @ApiProperty({ description: '有效天数', type: 'integer', required: false })
  @IsOptional()
  @IsNumber({}, { message: '有效天数必须是整数' })
  @Type(() => Number)
  validityDays?: number;

  @ApiProperty({ description: '扩展字段', required: false, type: 'object' })
  @IsOptional()
  payload?: object;
}
