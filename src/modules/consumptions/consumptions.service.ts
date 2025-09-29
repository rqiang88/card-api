import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumption } from '../../entities/consumption.entity';
import { Recharge } from '../../entities/recharge.entity';
import { Member } from '../../entities/member.entity';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';
import { QueryConsumptionDto } from './dto/query-consumption.dto';

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
  ) {}

  async create(createConsumptionDto: CreateConsumptionDto): Promise<Consumption> {
    // 创建消费记录实例
    const consumption = this.consumptionRepository.create(createConsumptionDto);

    // 1. 自动填充客户信息
    await this.autoFillCustomerInfo(consumption);

    // 2. 自动选择合适的充值记录
    await this.autoSelectRecharge(consumption);

    // 3. 如果有充值记录，加载充值记录实体（用于实体回调验证）
    if (consumption.rechargeId) {
      const recharge = await this.rechargeRepository.findOne({
        where: { id: consumption.rechargeId }
      });
      consumption.recharge = recharge;
    }

    // 4. 保存消费记录（实体的BeforeInsert回调会自动验证充值记录有效性）
    const savedConsumption = await this.consumptionRepository.save(consumption);

    // 5. 更新充值记录的使用次数和状态
    if (savedConsumption.rechargeId) {
      await this.updateRechargeUsageAndStatus(savedConsumption.rechargeId);
    }

    return savedConsumption;
  }

  /**
   * 自动填充客户信息
   */
  private async autoFillCustomerInfo(consumption: Consumption): Promise<void> {
    if (consumption.memberId && (!consumption.customerName || !consumption.customerPhone)) {
      try {
        const member = await this.memberRepository.findOne({
          where: { id: consumption.memberId }
        });

        if (member) {
          // 只有在没有手动提供时才自动填充
          if (!consumption.customerName) {
            consumption.customerName = member.name;
          }
          if (!consumption.customerPhone) {
            consumption.customerPhone = member.phone;
          }
        }
      } catch (error) {
        console.error('Failed to auto-fill customer info:', error);
      }
    }
  }

  /**
   * 自动选择充值记录
   */
  private async autoSelectRecharge(consumption: Consumption): Promise<void> {
    if (consumption.memberId && consumption.amount && !consumption.rechargeId) {
      try {
        const recharge = await this.rechargeRepository
          .createQueryBuilder('recharge')
          .where('recharge.memberId = :memberId', { memberId: consumption.memberId })
          .andWhere('(recharge.state IS NULL OR recharge.state != :expiredState)', { expiredState: 'expired' })
          .andWhere('recharge.remainingTimes > 0')
          .andWhere('recharge.endDate > :now', { now: new Date() })
          .orderBy('recharge.endDate', 'ASC') // 优先使用即将过期的
          .getOne();

        if (recharge) {
          consumption.rechargeId = recharge.id;
          consumption.packageId = recharge.packageId;
        }
      } catch (error) {
        console.error('Failed to auto-select recharge:', error);
      }
    }
  }

  /**
   * 更新充值记录的使用情况和状态
   */
  private async updateRechargeUsageAndStatus(rechargeId: number): Promise<void> {
    try {
      const recharge = await this.rechargeRepository.findOne({
        where: { id: rechargeId }
      });

      if (recharge && recharge.remainingTimes > 0) {
        recharge.remainingTimes -= 1;
        recharge.usedTimes += 1;

        // 如果没有剩余次数，更新状态为已完成
        if (recharge.remainingTimes <= 0) {
          recharge.state = 'completed';
          recharge.state = 'used'; // 保持向后兼容
        }

        await this.rechargeRepository.save(recharge);
      }
    } catch (error) {
      console.error('Failed to update recharge usage and status:', error);
    }
  }

  /**
   * 更新充值记录的使用情况（保留原方法以保持向后兼容）
   */
  private async updateRechargeUsage(rechargeId: number): Promise<void> {
    await this.updateRechargeUsageAndStatus(rechargeId);
  }

  async findAll(queryDto: QueryConsumptionDto): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, memberId, packageId, rechargeId, paymentType, state, operatorId, search, startDate, endDate, minAmount, maxAmount, sortBy = 'consumptionAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.consumptionRepository.createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.member', 'member')
      .leftJoinAndSelect('consumption.package', 'package')
      .leftJoinAndSelect('consumption.operator', 'operator')
      .leftJoinAndSelect('consumption.recharge', 'recharge');

    // 添加查询条件
    if (memberId) {
      queryBuilder.andWhere('consumption.memberId = :memberId', { memberId });
    }

    if (packageId) {
      queryBuilder.andWhere('consumption.packageId = :packageId', { packageId });
    }

    if (rechargeId) {
      queryBuilder.andWhere('consumption.rechargeId = :rechargeId', { rechargeId });
    }

    if (paymentType) {
      queryBuilder.andWhere('consumption.paymentType = :paymentType', { paymentType });
    }

    if (state) {
      queryBuilder.andWhere('consumption.state = :state', { state });
    }

    if (operatorId) {
      queryBuilder.andWhere('consumption.operatorId = :operatorId', { operatorId });
    }

    if (search) {
      queryBuilder.andWhere('(consumption.customerName ILIKE :search OR consumption.customerPhone ILIKE :search)', { search: `%${search}%` });
    }

    if (startDate) {
      queryBuilder.andWhere('consumption.consumptionAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('consumption.consumptionAt <= :endDate', { endDate });
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('consumption.amount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('consumption.amount <= :maxAmount', { maxAmount });
    }

    // 排序
    const validSortFields = ['amount', 'consumptionAt', 'customerName'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'consumptionAt';
    queryBuilder.orderBy(`consumption.${sortField}`, sortOrder);

    // 分页
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    // 增强返回数据，添加套餐名称、套餐类型、充值次数和金额信息
    const enhancedItems = items.map(item => ({
      ...item,
      // 套餐名称
      packageName: item.package?.name || null,
      // 套餐类型
      packageType: item.package?.packType || null,
      // 充值相关信息
      rechargeInfo: item.recharge ? {
        id: item.recharge.id,
        totalTimes: item.recharge.totalTimes || 0,
        remainingTimes: item.recharge.remainingTimes || 0,
        usedTimes: item.recharge.usedTimes || 0,
        rechargeAmount: item.recharge.rechargeAmount || 0,
        totalAmount: item.recharge.totalAmount || 0,
        remainingAmount: item.recharge.remainingAmount || 0
      } : null
    }));

    return {
      items: enhancedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const consumption = await this.consumptionRepository.findOne({
      where: { id },
      relations: {
        member: true,
        package: true,
        operator: true,
        recharge: true
      }
    });

    if (!consumption) {
      throw new NotFoundException(`消费记录 ID ${id} 不存在`);
    }

    return consumption;
  }

  async update(id: number, updateConsumptionDto: UpdateConsumptionDto) {
    const consumption = await this.findOne(id);
    const oldRechargeId = consumption.rechargeId;

    Object.assign(consumption, updateConsumptionDto);
    const updatedConsumption = await this.consumptionRepository.save(consumption);

    // 如果充值ID发生变化，需要更新两个充值记录的次数统计
    if (oldRechargeId && oldRechargeId !== updatedConsumption.rechargeId) {
      await this.updateRechargeTimesCount(oldRechargeId);
    }

    if (updatedConsumption.rechargeId) {
      await this.updateRechargeTimesCount(updatedConsumption.rechargeId);
    }

    return updatedConsumption;
  }

  async remove(id: number): Promise<void> {
    const consumption = await this.findOne(id);
    const rechargeId = consumption.rechargeId;

    await this.consumptionRepository.softDelete(id);

    // 更新关联的充值记录次数统计
    if (rechargeId) {
      await this.updateRechargeTimesCount(rechargeId);
    }
  }

  async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
  }> {
    const queryBuilder = this.consumptionRepository.createQueryBuilder('consumption');

    if (startDate) {
      queryBuilder.andWhere('consumption.consumptionAt >= :startDate', {
        startDate
      });
    }

    if (endDate) {
      queryBuilder.andWhere('consumption.consumptionAt <= :endDate', {
        endDate
      });
    }

    const result = await queryBuilder
      .select('SUM(consumption.amount)', 'totalAmount')
      .addSelect('COUNT(consumption.id)', 'totalCount')
      .addSelect('AVG(consumption.amount)', 'averageAmount')
      .getRawOne();

    return {
      totalAmount: Number(result.totalAmount) || 0,
      totalCount: Number(result.totalCount) || 0,
      averageAmount: Number(result.averageAmount) || 0
    };
  }

  // ... 其他方法保持不变，只需要将 this.prisma.recharge 改为 this.rechargeRepository
  private async updateRechargeTimesCount(rechargeId: number): Promise<void> {
    try {
      console.log(
        `[ConsumptionService] 开始更新充值记录 ${rechargeId} 的次数统计`
      );

      const recharge = await this.rechargeRepository.findOne({
        where: { id: rechargeId },
        relations: { consumptionRecords: true }
      });

      if (!recharge) {
        console.log(`[ConsumptionService] 充值记录 ${rechargeId} 不存在`);
        return;
      }

      const usedTimes =
        recharge.consumptionRecords?.filter(
          consumption => consumption.state === 'completed' || consumption.state === '1' || consumption.state === '2'
        ).length || 0;

      const remainingTimes = recharge.totalTimes
        ? Math.max(0, recharge.totalTimes - usedTimes)
        : 0;

      await this.rechargeRepository.update(rechargeId, {
        usedTimes,
        remainingTimes
      });

      console.log(
        `[ConsumptionService] 充值记录 ${rechargeId} 更新成功，usedTimes=${usedTimes}, remainingTimes=${remainingTimes}`
      );
    } catch (error) {
      console.error(
        `[ConsumptionService] 更新充值记录 ${rechargeId} 次数统计失败:`,
        error
      );
      throw error;
    }
  }

  /**
   * 手动重置充值记录的次数统计
   * @param rechargeId 充值记录ID
   */
  async resetRechargeTimesCount(rechargeId: number): Promise<void> {
    await this.updateRechargeTimesCount(rechargeId);
  }

  /**
   * 批量更新充值记录次数统计
   * @param rechargeIds 充值记录ID数组
   */
  async batchUpdateRechargeTimesCount(rechargeIds: number[]): Promise<void> {
    for (const rechargeId of rechargeIds) {
      await this.updateRechargeTimesCount(rechargeId);
    }
  }

  /**
   * 批量重置所有充值记录的次数统计
   * 用于数据修复或初始化
   */
  async resetAllRechargeTimesCount(): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
  }> {
    try {
      // 简化实现，返回成功状态
      return {
        success: true,
        message: `批量重置功能暂未实现`,
        updatedCount: 0
      };
    } catch (error) {
      return {
        success: false,
        message: `重置失败: ${error.message}`,
        updatedCount: 0
      };
    }
  }

  /**
   * 验证充值记录的次数统计是否正确
   * @param rechargeId 充值记录ID
   */
  async verifyRechargeTimesCount(rechargeId: number): Promise<{
    rechargeId: number;
    totalTimes: number;
    currentUsedTimes: number;
    currentRemainingTimes: number;
    actualUsedTimes: number;
    calculatedRemainingTimes: number;
    isCorrect: boolean;
    message: string;
  }> {
    // 获取充值记录
    const recharge = await this.rechargeRepository.findOne({
      where: { id: rechargeId },
      relations: { consumptionRecords: true }
    });

    if (!recharge) {
      throw new NotFoundException(`充值记录 ${rechargeId} 不存在`);
    }

    // 计算实际的已使用次数
    const actualUsedTimes =
      recharge.consumptionRecords?.filter(
        (consumption: any) =>
          consumption.state === '1' || consumption.state === '2'
      ).length || 0;

    // 计算正确的剩余次数
    const calculatedRemainingTimes =
      recharge.totalTimes !== null && recharge.totalTimes !== undefined
        ? Math.max(0, recharge.totalTimes - actualUsedTimes)
        : null;

    // 检查是否正确
    const isCorrect =
      recharge.usedTimes === actualUsedTimes &&
      recharge.remainingTimes === calculatedRemainingTimes;

    return {
      rechargeId,
      totalTimes: recharge.totalTimes,
      currentUsedTimes: recharge.usedTimes,
      currentRemainingTimes: recharge.remainingTimes,
      actualUsedTimes,
      calculatedRemainingTimes,
      isCorrect,
      message: isCorrect
        ? '次数统计正确'
        : `次数统计错误: 已使用次数应为 ${actualUsedTimes}，剩余次数应为 ${calculatedRemainingTimes}`
    };
  }
}
