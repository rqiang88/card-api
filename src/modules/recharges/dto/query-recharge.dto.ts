import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryRechargeDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10

  @ApiProperty({ description: '关键字', required: false })
  @IsOptional()
  @IsString()
  search?: string = ''

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  state?: string = ''

  @ApiProperty({ description: '会员ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  memberId?: number

  @ApiProperty({ description: '套餐ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  packageId?: number

  @ApiProperty({ description: '有效状态', enum: ['active', 'expired'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'expired'])
  validityStatus?: 'active' | 'expired'
}
