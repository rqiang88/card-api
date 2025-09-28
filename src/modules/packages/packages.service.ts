import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../../entities/package.entity';
import { Recharge } from '../../entities/recharge.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Recharge)
    private rechargeRepository: Repository<Recharge>
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    const pkg = this.packageRepository.create(createPackageDto);
    return await this.packageRepository.save(pkg);
  }

  async findAll(queryDto: QueryPackageDto): Promise<{
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
      pack_stype,
      category,
      state,
      minPrice,
      maxPrice,
      sortBy = 'position',
      sortOrder = 'ASC'
    } = queryDto;

    const queryBuilder = this.packageRepository.createQueryBuilder('package');

    // 搜索条件
    if (search) {
      queryBuilder.andWhere('package.name LIKE :search', {
        search: `%${search}%`
      });
    }

    // 套餐类型筛选
    if (pack_stype) {
      queryBuilder.andWhere('package.packType = :packType', {
        packType: pack_stype
      });
    }

    // 分类筛选
    if (category) {
      queryBuilder.andWhere('package.category = :category', { category });
    }

    // 状态筛选
    if (state) {
      queryBuilder.andWhere('package.state = :state', { state });
    }

    // 价格范围筛选
    if (minPrice !== undefined) {
      queryBuilder.andWhere('package.memberPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('package.memberPrice <= :maxPrice', { maxPrice });
    }

    // 排序
    const validSortFields = [
      'name',
      'originalPrice',
      'memberPrice',
      'position',
      'salesCount',
      'createdAt'
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'position';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder
      .orderBy(`package.${sortField}`, order)
      .addOrderBy('package.createdAt', 'DESC')
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

  async findOne(id: number) {
    const pkg = await this.packageRepository.findOne({
      where: { id },
      relations: {
        consumptionRecords: true,
        rechargeRecords: true
      }
    });

    if (!pkg) {
      throw new NotFoundException(`套餐 ID ${id} 不存在`);
    }

    return pkg;
  }

  async update(id: number, updatePackageDto: UpdatePackageDto) {
    await this.packageRepository.update(id, updatePackageDto);
    const pkg = await this.findOne(id);
    return pkg
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.packageRepository.softDelete(id);
  }

  async updateSalesCount(id: number): Promise<void> {
    // 统计该套餐的充值记录数量
    const rechargeCount = await this.rechargeRepository.count({
      where: { packageId: id }
    });
    
    // 更新套餐的销售数量
    await this.packageRepository.update(id, { salesCount: rechargeCount });
  }

  // 保留原有的增量方法以兼容现有代码
  async incrementSalesCount(id: number): Promise<void> {
    await this.packageRepository.increment({ id }, 'salesCount', 1);
  }
}
