import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from './redis.service'
import { REDIS_CLIENT } from './constants/redis.constants'
import Redis from 'ioredis'

@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    const redisProvider = {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const redisConfig = {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        }

        const client = new Redis(redisConfig)

        client.on('error', (err) => {
          console.error('Redis connection error:', err)
        })

        client.on('connect', () => {
          console.log('Redis connected successfully')
        })

        client.on('ready', () => {
          console.log('Redis is ready to receive commands')
        })

        return client
      },
      inject: [ConfigService],
    }

    return {
      module: RedisModule,
      providers: [redisProvider, RedisService],
      exports: [redisProvider, RedisService],
    }
  }
}
