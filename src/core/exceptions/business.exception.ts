import { HttpException, HttpStatus } from '@nestjs/common'

export class BusinessException extends HttpException {
  constructor(message: string, code?: string) {
    super(
      {
        message,
        code: code || 'BUSINESS_ERROR',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}
