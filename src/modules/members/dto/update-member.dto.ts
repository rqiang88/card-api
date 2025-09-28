import { PartialType } from '@nestjs/swagger'
import { CreateMemberDto } from './create-member.dto'

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  // 继承 CreateMemberDto 的所有字段，并将它们设为可选
  // 这样可以支持部分更新
}
