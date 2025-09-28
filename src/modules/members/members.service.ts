import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    // 检查手机号是否已存在
    const existingMember = await this.memberRepository.findOne({
      where: { phone: createMemberDto.phone }
    });

    if (existingMember) {
      throw new ConflictException('手机号已存在');
    }

    const member = this.memberRepository.create(createMemberDto);
    return await this.memberRepository.save(member);
  }

  async findAll(queryDto: QueryMemberDto): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, level, state } = queryDto;

    const queryBuilder = this.memberRepository.createQueryBuilder('member');

    // 搜索条件
    if (search) {
      queryBuilder.andWhere(
        'member.name LIKE :search OR member.phone LIKE :search',
        { search: `%${search}%` }
      );
    }

    // 等级筛选
    if (level) {
      queryBuilder.andWhere('member.level = :level', { level });
    }

    // 状态筛选
    if (state !== undefined) {
      queryBuilder.andWhere('member.state = :state', { state });
    }

    // 分页和排序
    queryBuilder
      .orderBy('member.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { items, total, page, limit, totalPages };
  }

  async findOne(id: number) {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: {
        consumptionRecords: {
          package: true
        },
        rechargeRecords: {
          package: true
        }
      }
    });

    if (!member) {
      throw new NotFoundException(`会员 ID ${id} 不存在`);
    }

    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id);

    // 如果更新手机号，检查是否重复
    if (updateMemberDto.phone) {
      const existingMember = await this.memberRepository.findOne({
        where: { phone: updateMemberDto.phone }
      });

      if (existingMember && existingMember.id !== id) {
        throw new ConflictException('手机号已存在');
      }
    }

    Object.assign(member, updateMemberDto);
    return await this.memberRepository.save(member);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.memberRepository.softDelete(id);
  }

  async updateBalance(id: number, amount: number) {
    const member = await this.findOne(id);
    const newBalance = Number(member.balance) + amount;
    return await this.memberRepository.update(id, { balance: newBalance });
  }

  async updatePoints(id: number, points: number) {
    const member = await this.findOne(id);
    const newPoints = Number(member.points) + points;
    return await this.memberRepository.update(id, { points: newPoints });
  }
}
