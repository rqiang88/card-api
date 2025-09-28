import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  account: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string
}
