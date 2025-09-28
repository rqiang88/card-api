import { IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryMemberDto {
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

  @ApiProperty({ description: '搜索关键词(姓名或手机号)', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: '会员等级', required: false, maxLength: 10 })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  level?: string

  @ApiProperty({ description: '会员状态', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  state?: string

  @ApiProperty({ description: '性别筛选', required: false, maxLength: 10 })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  gender?: string

  @ApiProperty({ description: '注册开始时间', required: false, type: 'string', format: 'date-time' })
  @IsString()
  @IsOptional()
  registerStartDate?: string

  @ApiProperty({ description: '注册结束时间', required: false, type: 'string', format: 'date-time' })
  @IsString()
  @IsOptional()
  registerEndDate?: string
}
