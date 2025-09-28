import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    // 获取详细的错误信息
    const exceptionResponse = exception.getResponse()
    let message = exception.message
    let details = null

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || exception.message
      details = (exceptionResponse as any).message
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: Array.isArray(message) ? message.join(', ') : message,
      details: details,
      data: null,
    }

    response.status(status).json(errorResponse)
  }
}
