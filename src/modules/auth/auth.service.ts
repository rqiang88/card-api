import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@/shared/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../../entities/user.entity';
import { CryptoUtil } from '@/core/utils/crypto.util';
import { ValidateException } from '@/core/exceptions/validate.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const { account, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { account } });
    if (user && await CryptoUtil.comparePassword(password, user.password)) {
      const { id, account, name } = user;
      const data = JSON.stringify({ id, account, name });
      const token = CryptoUtil.hashPassword(data);
      this.redisService.set(token, data, 7200);
      return token;
    } else {
      throw new ValidateException('用户名或者密码错误');
    }
  }

  async logout(token: string) {
    this.redisService.del(token);
  }
}
