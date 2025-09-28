import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { RedisService } from '@/shared/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService
  ) {}

  async findByAccount(account: string) {
    return this.userRepository.findOne({ where: { account } });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // 检查账号是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { account: createUserDto.account },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('账号或邮箱已存在');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(queryDto: QueryUserDto): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, role, state, gender } = queryDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 搜索条件
    if (search) {
      queryBuilder.andWhere(
        'user.name LIKE :search OR user.account LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    // 角色筛选
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // 状态筛选
    if (state) {
      queryBuilder.andWhere('user.state = :state', { state });
    }

    // 性别筛选
    if (gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender });
    }

    // 分页和排序
    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // 如果更新账号或邮箱，检查是否已存在
    if (updateUserDto.account || updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { account: updateUserDto.account },
          { email: updateUserDto.email }
        ]
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('账号或邮箱已存在');
      }
    }

    // 如果有新密码，使用虚拟字段处理密码更新
    if (updateUserDto.newPassword) {
      user.passwordRaw = updateUserDto.newPassword;
      delete updateUserDto.newPassword;
    }

    // 合并更新数据
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async fetchInfo(token) {
    const data = await this.redisService.get(token);
    if (!data) {
      throw new UnauthorizedException();
    }
    const user = JSON.parse(data);
    return await this.userRepository.findOne({ where: { id: user.id } });
  }

  async updateLastLoginTime(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date()
    });
  }
}
