import { RedisService } from '@/shared/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.reflector.get<boolean>('authorization', context.getHandler()))
      return true;
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    // if (token) {
    //   this.redisService.get(token).then((value) => {
    //     if (value) {
    //       Object.assign(request, { user: JSON.parse(value) });
    //     } else {
    //       throw new UnauthorizedException();
    //     }
    //   })
    // } else {
    //   throw new UnauthorizedException();
    // }
    return true;
  }
}
