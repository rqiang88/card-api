import { Inject, Injectable } from '@nestjs/common'
import { REDIS_CLIENT } from './constants/redis.constants'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis
  ) {}

  async get(key: string) {
    const value =  await this.redis.get(key)
    return value
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value)
    } else {
      await this.redis.set(key, value)
    }
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field)
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redis.hset(key, field, value)
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.redis.hdel(key, field)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds)
  }

  getClient(): Redis {
    return this.redis
  }
}
