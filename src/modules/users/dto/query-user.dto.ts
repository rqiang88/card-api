import { IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryUserDto {
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

  @ApiProperty({ description: '搜索关键词(姓名、账号或邮箱)', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: '角色筛选', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  role?: string

  @ApiProperty({ description: '状态筛选', required: false })
  @IsString()
  @IsOptional()
  state?: string

  @ApiProperty({ description: '性别筛选', required: false, maxLength: 10 })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  gender?: string
}
