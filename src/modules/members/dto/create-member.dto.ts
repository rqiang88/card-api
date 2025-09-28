import { IsString, IsEmail, IsOptional, IsNumber, Min, IsDateString, IsObject, MaxLength, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type, Transform } from 'class-transformer'

export class CreateMemberDto {
  @ApiProperty({ description: '会员姓名', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ description: '手机号码', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  phone: string

  @ApiProperty({ description: '邮箱地址', required: false, maxLength: 100 })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEmail()
  @MaxLength(100)
  email?: string

  @ApiProperty({ description: '性别', maxLength: 10, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  gender?: string

  @ApiProperty({ description: '生日', required: false, type: 'string', format: 'date' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString()
  birthday?: string

  @ApiProperty({ description: '会员等级', maxLength: 10, required: false, default: 'normal' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  level?: string

  @ApiProperty({ description: '初始余额', default: 0, type: 'number', format: 'decimal' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  balance?: number

  @ApiProperty({ description: '初始积分', default: 0, type: 'integer' })
  @IsNumber({}, { message: '积分必须是整数' })
  @IsOptional()
  @Type(() => Number)
  points?: number

  @ApiProperty({ 
    description: '会员状态', 
    enum: ['active', 'disabled'], 
    required: false, 
    default: 'active' 
  })
  @IsOptional()
  @IsEnum(['active', 'disabled'], { message: '状态必须是 active 或 disabled' })
  state?: 'active' | 'disabled'

  @ApiProperty({ description: '头像信息', required: false, type: 'object' })
  @IsOptional()
  @IsObject()
  avatar?: object

  @ApiProperty({ description: '注册时间', required: false, type: 'string', format: 'date-time' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString()
  registerAt?: string

  @ApiProperty({ description: '备注', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string

  @ApiProperty({ description: '扩展字段', required: false, type: 'object' })
  @IsOptional()
  @IsObject()
  payload?: object
}
