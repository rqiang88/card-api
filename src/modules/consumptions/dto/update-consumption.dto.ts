import { PartialType } from '@nestjs/swagger'
import { CreateConsumptionDto } from './create-consumption.dto'

export class UpdateConsumptionDto extends PartialType(CreateConsumptionDto) {
  // 继承 CreateConsumptionDto 的所有字段，并将它们设为可选
  // 这样可以支持部分更新
}
