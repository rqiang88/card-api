import { PartialType } from '@nestjs/swagger'
import { CreatePackageDto } from './create-package.dto'

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  // 继承 CreatePackageDto 的所有字段，并将它们设为可选
  // 这样可以支持部分更新
}
