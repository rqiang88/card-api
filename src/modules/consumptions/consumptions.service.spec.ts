import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConsumptionService } from './consumptions.service';
import { Consumption } from '../../entities/consumption.entity';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { UpdateConsumptionDto } from './dto/update-consumption.dto';
import { QueryConsumptionDto } from './dto/query-consumption.dto';

describe('ConsumptionService', () => {
  let service: ConsumptionService;
  let repository: Repository<Consumption>;

  const mockConsumption = {
    id: 1,
    memberId: 1,
    customerName: '张三',
    customerPhone: '13800138000',
    packageId: 1,
    amount: 100.0,
    paymentType: 'cash',
    seq: 'TXN001',
    state: 'completed',
    consumptionAt: new Date(),
    operatorId: 1,
    remark: '测试消费',
    payload: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    member: null,
    package: null,
    operator: null
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn()
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getRawOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumptionService,
        {
          provide: getRepositoryToken(Consumption),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<ConsumptionService>(ConsumptionService);
    repository = module.get<Repository<Consumption>>(
      getRepositoryToken(Consumption)
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new consumption record successfully', async () => {
      const createConsumptionDto: CreateConsumptionDto = {
        memberId: 1,
        customerName: '张三',
        customerPhone: '13800138000',
        packageId: 1,
        amount: 100.0,
        paymentType: 'cash',
        seq: 'TXN001',
        operatorId: 1,
        remark: '测试消费'
      };

      mockRepository.create.mockReturnValue(mockConsumption);
      mockRepository.save.mockResolvedValue(mockConsumption);

      const result = await service.create(createConsumptionDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createConsumptionDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockConsumption);
      expect(result).toEqual(mockConsumption);
    });
  });

  describe('findAll', () => {
    it('should return paginated consumption records without filters', async () => {
      const queryDto: QueryConsumptionDto = { page: 1, limit: 10 };
      const mockResult = [[mockConsumption], 1];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult);

      const result = await service.findAll(queryDto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'consumption'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'consumption.member',
        'member'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'consumption.package',
        'package'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'consumption.operator',
        'operator'
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'consumption.consumptionAt',
        'DESC'
      );
      expect(result).toEqual({
        items: [mockConsumption],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should apply search filter', async () => {
      const queryDto: QueryConsumptionDto = {
        page: 1,
        limit: 10,
        search: '张三'
      };
      const mockResult = [[mockConsumption], 1];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'consumption.customerName LIKE :search OR consumption.customerPhone LIKE :search',
        { search: '%张三%' }
      );
    });

    it('should apply member filter', async () => {
      const queryDto: QueryConsumptionDto = { page: 1, limit: 10, memberId: 1 };
      const mockResult = [[mockConsumption], 1];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.memberId = :memberId',
        { memberId: 1 }
      );
    });

    it('should apply date range filter', async () => {
      const queryDto: QueryConsumptionDto = {
        page: 1,
        limit: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResult = [[mockConsumption], 1];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.consumptionAt >= :startDate',
        { startDate: '2024-01-01' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.consumptionAt <= :endDate',
        { endDate: '2024-12-31' }
      );
    });

    it('should apply amount range filter', async () => {
      const queryDto: QueryConsumptionDto = {
        page: 1,
        limit: 10,
        minAmount: 50,
        maxAmount: 200
      };
      const mockResult = [[mockConsumption], 1];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.amount >= :minAmount',
        { minAmount: 50 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.amount <= :maxAmount',
        { maxAmount: 200 }
      );
    });
  });

  describe('findOne', () => {
    it('should return a consumption record by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockConsumption);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['member', 'package', 'operator']
      });
      expect(result).toEqual(mockConsumption);
    });

    it('should throw NotFoundException when consumption record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a consumption record successfully', async () => {
      const updateConsumptionDto: UpdateConsumptionDto = {
        amount: 150.0,
        remark: '更新后的备注'
      };

      const updatedConsumption = {
        ...mockConsumption,
        ...updateConsumptionDto
      };

      mockRepository.findOne.mockResolvedValue(mockConsumption);
      mockRepository.save.mockResolvedValue(updatedConsumption);

      const result = await service.update(1, updateConsumptionDto);

      expect(result).toEqual(updatedConsumption);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when consumption record not found', async () => {
      const updateConsumptionDto: UpdateConsumptionDto = { amount: 150.0 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateConsumptionDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a consumption record', async () => {
      mockRepository.findOne.mockResolvedValue(mockConsumption);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['member', 'package', 'operator']
      });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when consumption record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return consumption statistics', async () => {
      const mockStats = {
        totalAmount: '1000.00',
        totalCount: '10',
        averageAmount: '100.00'
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawOne.mockResolvedValue(mockStats);

      const result = await service.getStatistics('2024-01-01', '2024-12-31');

      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'SUM(consumption.amount)',
        'totalAmount'
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'COUNT(consumption.id)',
        'totalCount'
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'AVG(consumption.amount)',
        'averageAmount'
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.consumptionAt >= :startDate',
        { startDate: '2024-01-01' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'consumption.consumptionAt <= :endDate',
        { endDate: '2024-12-31' }
      );

      expect(result).toEqual({
        totalAmount: 1000.0,
        totalCount: 10,
        averageAmount: 100.0
      });
    });

    it('should handle null statistics', async () => {
      const mockStats = {
        totalAmount: null,
        totalCount: null,
        averageAmount: null
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawOne.mockResolvedValue(mockStats);

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0
      });
    });
  });
});
