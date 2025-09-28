import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsObject,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ description: '套餐名称', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '套餐描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '套餐类型: amount-按金额, times-按次数, normal-普通套餐',
    default: 'amount',
    example: 'amount',
    enum: ['amount', 'times', 'normal']
  })
  @IsOptional()
  @IsString()
  packType?: string;

  @ApiProperty({ description: '套餐分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '图标URL', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '原价', type: 'number', format: 'decimal' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: '现价/售价', type: 'number', format: 'decimal' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salePrice: number;

  @ApiProperty({
    description: '会员价',
    type: 'number',
    format: 'decimal',
    required: false
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  memberPrice?: number;

  @ApiProperty({ description: '有效期天数', type: 'integer' })
  @IsOptional()
  @IsNumber({}, { message: '有效期天数必须是整数' })
  @Min(1)
  @Type(() => Number)
  validDay: number;

  @ApiProperty({
    description: '总次数(仅按次数套餐)',
    required: false,
    type: 'integer'
  })
  @IsOptional()
  @IsNumber({}, { message: '总次数必须是整数' })
  @Min(1)
  @Type(() => Number)
  totalTimes?: number;

  @ApiProperty({ description: '状态', required: false, default: 'active' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: '排序权重',
    required: false,
    type: 'integer',
    default: 0
  })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是整数' })
  @Min(0)
  @Type(() => Number)
  position?: number;

  // @ApiProperty({
  //   description: '销售数量',
  //   required: false,
  //   type: 'integer',
  //   default: 0
  // })
  // @IsNumber({}, { message: '销售数量必须是整数' })
  // @Min(0)
  // @IsOptional()
  // @Type(() => Number)
  // salesCount?: number;

  @ApiProperty({ description: '扩展字段', required: false, type: 'object' })
  @IsObject()
  @IsOptional()
  payload?: object;
}
