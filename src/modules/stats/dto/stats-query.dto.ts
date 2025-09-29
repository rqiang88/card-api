import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StatsQueryDto {
  @ApiProperty({
    description: '统计时间范围',
    enum: ['today', 'week', 'month', 'year', 'custom'],
    default: 'today',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['today', 'week', 'month', 'year', 'custom'])
  period?: 'today' | 'week' | 'month' | 'year' | 'custom' = 'today';

  @ApiProperty({
    description: '自定义开始日期 (YYYY-MM-DD)',
    required: false,
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '自定义结束日期 (YYYY-MM-DD)',
    required: false,
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
