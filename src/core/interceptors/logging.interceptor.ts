import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;

    // 记录请求信息
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`
    );
    
    // 记录查询参数
    if (Object.keys(query).length > 0) {
      this.logger.log(`🔍 Query Params: ${JSON.stringify(query)}`);
    }
    
    // 记录路径参数
    if (Object.keys(params).length > 0) {
      this.logger.log(`📍 Path Params: ${JSON.stringify(params)}`);
    }
    
    // 记录请求体（排除敏感信息）
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.log(`📦 Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.log(
            `📤 ${method} ${url} - ✅ Success - Duration: ${duration}ms`
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.error(
            `📤 ${method} ${url} - ❌ Error: ${error.message} - Duration: ${duration}ms`
          );
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}