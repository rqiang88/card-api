import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: '新密码', required: false })
  @IsString()
  @IsOptional()
  newPassword?: string
}
