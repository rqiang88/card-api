import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevenueQueryDto {
  @ApiProperty({
    description: '开始日期 (YYYY-MM-DD)',
    required: false,
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '结束日期 (YYYY-MM-DD)',
    required: false,
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
