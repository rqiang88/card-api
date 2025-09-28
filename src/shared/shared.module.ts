import { Global, Module } from '@nestjs/common'
import { RedisModule } from './redis/redis.module'
import { RedisService } from './redis/redis.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

/**
 * SharedModule - 全局共享模块
 * 包含所有需要在整个应用中共享的服务和模块
 *
 * 注意：由于 RedisModule.forRootAsync() 返回的动态模块已经设置了 global: true，
 * 所以 RedisService 会自动在整个应用中可用，无需在这里重复导出
 */
@Global()
@Module({
  imports: [
    // Redis模块 - 动态注册并全局可用
    RedisModule.forRootAsync(),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => configService.get('jwt'),
      inject: [ConfigService]
    }),
  ],
  providers: [JwtService, RedisService],
  exports: [JwtService, RedisService],
  // 由于 RedisModule 已经设置为 global: true，这里不需要导出任何内容
  // RedisService 会自动在整个应用中可用
})
export class SharedModule {}
