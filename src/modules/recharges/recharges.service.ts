import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recharge } from '../../entities/recharge.entity';
import { Package } from '../../entities/package.entity';
import { Consumption } from '../../entities/consumption.entity';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { UpdateRechargeDto } from './dto/update-recharge.dto';
import { QueryRechargeDto } from './dto/query-recharge.dto';

@Injectable()
export class RechargesService {
  constructor(
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>
  ) {}

  async create(createRechargeDto: CreateRechargeDto) {
    let packageInfo = null;

    // 如果是套餐充值，验证套餐是否存在
    if (createRechargeDto.type === 'package' && createRechargeDto.packageId) {
      packageInfo = await this.packageRepository.findOne({
        where: { id: createRechargeDto.packageId }
      });

      if (!packageInfo) {
        throw new NotFoundException(
          `套餐 ID ${createRechargeDto.packageId} 不存在`
        );
      }
    }

    // 处理时间相关字段
    const rechargeData = { ...createRechargeDto };

    // 设置startDate为充值时间
    let startDate: Date;
    if (rechargeData.rechargeAt) {
      startDate = new Date(rechargeData.rechargeAt);
      rechargeData.startDate = startDate.toISOString().split('T')[0]; // 转换为YYYY-MM-DD格式
    } else {
      startDate = new Date();
      rechargeData.startDate = startDate.toISOString().split('T')[0];
    }

    // 计算endDate（到期时间）
    let endDate: Date;
    if (rechargeData.validityDays && rechargeData.validityDays > 0) {
      // 如果有有效天数，使用有效天数计算
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + rechargeData.validityDays);
      rechargeData.endDate = endDate.toISOString().split('T')[0];
    } else if (packageInfo && packageInfo.validDay && packageInfo.validDay > 0) {
      // 如果是套餐充值且套餐有有效天数，使用套餐的有效天数
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + packageInfo.validDay);
      rechargeData.endDate = endDate.toISOString().split('T')[0];
    } else {
      // 默认有效期为1年
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      rechargeData.endDate = endDate.toISOString().split('T')[0];
    }

    // 创建充值记录，套餐信息同步由实体监听器自动处理
    const recharge = this.rechargeRepository.create(rechargeData);
    const savedRecharge = await this.rechargeRepository.save(recharge);

    // 如果是普通套餐充值，自动创建消费记录
    if (packageInfo && packageInfo.packType === 'normal') {
      const consumption = this.consumptionRepository.create({
        memberId: savedRecharge.memberId,
        rechargeId: savedRecharge.id,
        packageId: savedRecharge.packageId,
        amount: savedRecharge.totalAmount,
        paymentType: savedRecharge.paymentType,
        state: 'completed',
        consumptionAt: savedRecharge.rechargeAt,
        operatorId: savedRecharge.operatorId
      });

      await this.consumptionRepository.save(consumption);

      // 更新充值记录的使用次数和剩余次数
      savedRecharge.usedTimes = (savedRecharge.usedTimes || 0) + 1;
      savedRecharge.remainingTimes = savedRecharge.totalTimes - savedRecharge.usedTimes;
      // 保存更新后的充值记录，触发实体监听器自动更新状态
      await this.rechargeRepository.save(savedRecharge);
    }

    // 更新套餐销售数量
    if (savedRecharge.packageId) {
      await this.updateSalesCount(savedRecharge.packageId);
    }

    return savedRecharge;
  }

  async findAll(queryDto: QueryRechargeDto): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      memberId,
      packageId,
      state,
    } = queryDto;

    // 使用 TypeORM 关系查询构建器
    const queryBuilder = this.rechargeRepository
      .createQueryBuilder('recharge')
      .leftJoinAndSelect('recharge.member', 'member')
      .leftJoinAndSelect('recharge.package', 'package')

    // 根据关键字搜索套餐和会员信息
    if (search) {
      queryBuilder.andWhere(
        '(member.name LIKE :search OR member.phone LIKE :search OR member.name LIKE :search OR package.name LIKE :search OR package.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 根据 memberId 进行精确搜索
    if (memberId) {
      queryBuilder.andWhere('recharge.memberId = :memberId', { memberId });
    }

    // 根据 memberId 进行精确搜索
    if (packageId) {
      queryBuilder.andWhere('recharge.packageId = :packageId', { packageId });
    }

    // 有效性状态过滤
    if (state) {
      queryBuilder.andWhere('recharge.state = :state', { state });
    }

    // 排序
    queryBuilder.orderBy('recharge.rechargeAt', 'DESC');

    // 分页
    queryBuilder.skip((page - 1) * limit).take(limit);

    // 执行查询
    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const recharge = await this.rechargeRepository.findOne({
      where: { id },
      relations: {
        member: true,
        package: true,
        operator: true
      }
    });

    if (!recharge) {
      throw new NotFoundException(`充值记录 ID ${id} 不存在`);
    }

    return recharge;
  }

  async update(id: number, updateRechargeDto: UpdateRechargeDto) {
    const recharge = await this.findOne(id);

    // 如果更新了充值金额或赠送金额，重新计算总金额
    if (
      updateRechargeDto.rechargeAmount !== undefined ||
      updateRechargeDto.bonusAmount !== undefined
    ) {
      const rechargeAmount = Number(
        updateRechargeDto.rechargeAmount ?? recharge.rechargeAmount
      );
      const bonusAmount = Number(
        updateRechargeDto.bonusAmount ?? recharge.bonusAmount
      );
      updateRechargeDto.totalAmount = rechargeAmount + bonusAmount;
    }

    // 如果更新了总次数或已使用次数，重新计算剩余次数
    if (
      updateRechargeDto.totalTimes !== undefined ||
      updateRechargeDto.usedTimes !== undefined
    ) {
      const totalTimes = updateRechargeDto.totalTimes ?? recharge.totalTimes;
      const usedTimes = updateRechargeDto.usedTimes ?? recharge.usedTimes;
      if (totalTimes) {
        updateRechargeDto.remainingTimes = totalTimes - usedTimes;
      }
    }

    Object.assign(recharge, updateRechargeDto);
    return await this.rechargeRepository.save(recharge);
  }

  async remove(id: number): Promise<void> {
    const recharge = await this.findOne(id);
    await this.rechargeRepository.softDelete(id);
    
    // 更新套餐销售数量
    if (recharge.packageId) {
      await this.updateSalesCount(recharge.packageId);
    }
  }

  async consumeAmount(id: number, amount: number) {
    const recharge = await this.findOne(id);

    if (Number(recharge.remainingAmount) < amount) {
      throw new Error('余额不足');
    }

    const newRemainingAmount = Number(recharge.remainingAmount) - amount;
    await this.rechargeRepository.update(id, {
      remainingAmount: newRemainingAmount
    });
    return await this.rechargeRepository.findOneByOrFail({ id });
  }

  async consumeTimes(id: number, times: number = 1) {
    const recharge = await this.findOne(id);

    if (!recharge.remainingTimes || recharge.remainingTimes < times) {
      throw new Error('剩余次数不足');
    }

    await this.rechargeRepository.update(id, {
      usedTimes: recharge.usedTimes + times,
      remainingTimes: recharge.remainingTimes - times
    });
    return await this.rechargeRepository.findOneByOrFail({ id });
  }

  async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
  }> {
    const queryBuilder = this.rechargeRepository.createQueryBuilder('recharge');

    if (startDate) {
      queryBuilder.andWhere('recharge.rechargeAt >= :startDate', {
        startDate
      });
    }

    if (endDate) {
      queryBuilder.andWhere('recharge.rechargeAt <= :endDate', { endDate });
    }

    const result = await queryBuilder
      .select('SUM(recharge.rechargeAmount)', 'totalAmount')
      .addSelect('COUNT(*)', 'totalCount')
      .getRawOne();

    const totalAmount = parseFloat(result.totalAmount) || 0;
    const totalCount = parseInt(result.totalCount) || 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      totalAmount,
      totalCount,
      averageAmount
    };
  }

  /**
   * 更新套餐的销售数量
   */
  private async updateSalesCount(packageId: number): Promise<void> {
    if (!packageId) return;

    // 计算该套餐的充值记录数量（排除软删除的记录）
    const salesCount = await this.rechargeRepository.count({
      where: { packageId },
      withDeleted: false
    });

    // 更新套餐的销售数量
    await this.packageRepository.update(packageId, { salesCount });
  }
}
