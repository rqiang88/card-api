import { PartialType } from '@nestjs/swagger'
import { CreateRechargeDto } from './create-recharge.dto'
import { IsOptional } from 'class-validator'

export class UpdateRechargeDto extends PartialType(CreateRechargeDto) {
  // 继承 CreateRechargeDto 的所有字段，并将它们设为可选
  // 这样可以支持部分更新
}
