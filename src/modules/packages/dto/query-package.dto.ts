import { IsOptional, IsString, IsNumber, Min, IsEnum, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryPackageDto {
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

  @ApiProperty({ description: '搜索关键词(套餐名称)', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ 
    description: '套餐类型筛选', 
    enum: ['amount', 'times'], 
    required: false 
  })
  @IsEnum(['amount', 'times'])
  @IsOptional()
  pack_stype?: string

  @ApiProperty({ description: '分类筛选', required: false })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ description: '状态筛选', required: false })
  @IsString()
  @IsOptional()
  state?: string

  @ApiProperty({ description: '最小价格', required: false, type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number

  @ApiProperty({ description: '最大价格', required: false, type: 'number' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number

  @ApiProperty({ description: '排序字段', required: false, enum: ['name', 'originalPrice', 'memberPrice', 'position', 'salesCount', 'createdAt'] })
  @IsEnum(['name', 'originalPrice', 'memberPrice', 'position', 'salesCount', 'createdAt'])
  @IsOptional()
  sortBy?: string

  @ApiProperty({ description: '排序方向', required: false, enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC'
}
