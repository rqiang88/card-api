import { IsString, IsEmail, IsOptional, IsDateString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户姓名', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: '账号', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  account: string

  @ApiProperty({ description: '性别', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  gender: string

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string

  @ApiProperty({ description: '邮箱', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  email: string

  @ApiProperty({ description: '手机号', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  mobile: string

  @ApiProperty({ description: '角色', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  role: string

  @ApiProperty({ description: '状态', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  state: string

  @ApiProperty({ description: '最后登录时间', required: false, type: 'string', format: 'date-time' })
  @IsDateString()
  @IsOptional()
  lastLoginAt?: string

  @ApiProperty({ description: '扩展字段', required: false })
  @IsString()
  @IsOptional()
  payload?: string
}
