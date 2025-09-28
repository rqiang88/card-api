import { HttpException } from '@nestjs/common';

export class ValidateException extends HttpException {
  constructor(message = '', code = 411) {
    super(message, code);
  }
}
