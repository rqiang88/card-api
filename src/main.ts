import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

async function bootstrap() {
  // 设置全局时区为北京时间
  process.env.TZ = process.env.TIMEZONE || 'Asia/Shanghai';

  // 确保 Node.js 使用正确的时区
  const logger = new Logger('Bootstrap');
  logger.log(`应用时区设置为: ${process.env.TZ}`);
  logger.log(`当前时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  // 配置Logger - 根据环境设置不同的日志级别
  const logLevels: LogLevel[] =
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels
  });

  // 全局日志拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  });

  // API 前缀
  app.setGlobalPrefix('api');

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('会员管理系统 API')
    .setDescription('会员管理系统后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // 使用Logger替代console.log
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/api`,
    'Bootstrap'
  );
  Logger.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
    'Bootstrap'
  );
}
bootstrap();
