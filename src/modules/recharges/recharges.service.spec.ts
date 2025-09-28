import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { RechargesService } from './recharges.service'
import { Recharge } from '../../entities/recharge.entity'
import { CreateRechargeDto } from './dto/create-recharge.dto'
import { UpdateRechargeDto } from './dto/update-recharge.dto'
import { QueryRechargeDto } from './dto/query-recharge.dto'

describe('RechargeService', () => {
  let service: RechargesService
  let repository: Repository<Recharge>

  const mockRecharge = {
    id: 1,
    memberId: 1,
    packageId: 1,
    rechargeAmount: 1000.00,
    bonusAmount: 100.00,
    totalAmount: 1100.00,
    totalTimes: 10,
    usedTimes: 0,
    remainingTimes: 10,
    remainingAmount: 1100.00,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    paymentType: 'cash',
    seq: 'RCH001',
    state: 'active',
    rechargeAr: new Date(),
    operatorId: 1,
    remark: '测试充值',
    payload: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    member: null,
    package: null,
    operator: null,
  }

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

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
    getRawOne: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RechargesService,
        {
          provide: getRepositoryToken(Recharge),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<RechargesService>(RechargesService)
    repository = module.get<Repository<Recharge>>(getRepositoryToken(Recharge))

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new recharge record successfully', async () => {
      const createRechargeDto: CreateRechargeDto = {
        type: 'package',
        memberId: 1,
        packageId: 1,
        rechargeAmount: 1000.00,
        bonusAmount: 100.00,
        totalAmount: 1100.00,
        totalTimes: 10,
        remainingAmount: 1100.00,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        paymentType: 'cash',
        seq: 'RCH001',
        operatorId: 1,
        remark: '测试充值',
      }

      mockRepository.create.mockReturnValue(mockRecharge)
      mockRepository.save.mockResolvedValue(mockRecharge)

      const result = await service.create(createRechargeDto)

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createRechargeDto,
        totalAmount: 1100.00,
        remainingAmount: 1100.00,
        usedTimes: 0,
        remainingTimes: 10
      }))
      expect(mockRepository.save).toHaveBeenCalledWith(mockRecharge)
      expect(result).toEqual(mockRecharge)
    })

    it('should calculate total amount correctly', async () => {
      const createRechargeDto: CreateRechargeDto = {
        type: 'package',
        memberId: 1,
        packageId: 1,
        rechargeAmount: 500.00,
        bonusAmount: 50.00,
        totalAmount: 550.00,
        remainingAmount: 550.00,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        paymentType: 'cash',
        seq: 'RCH002',
        operatorId: 1,
        remark: '测试充值',
      }

      mockRepository.create.mockReturnValue(mockRecharge)
      mockRepository.save.mockResolvedValue(mockRecharge)

      await service.create(createRechargeDto)

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 550.00,
        remainingAmount: 550.00
      }))
    })
  })

  describe('findAll', () => {
    it('should return paginated recharge records without filters', async () => {
      const queryDto: QueryRechargeDto = { page: 1, limit: 10 }
      const mockResult = [[mockRecharge], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      const result = await service.findAll(queryDto)

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('recharge')
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('recharge.member', 'member')
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('recharge.package', 'package')
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('recharge.operator', 'operator')
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('recharge.rechargeAr', 'DESC')
      expect(result).toEqual({
        items: [mockRecharge],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      })
    })

    it('should apply member filter', async () => {
      const queryDto: QueryRechargeDto = { page: 1, limit: 10, memberId: 1 }
      const mockResult = [[mockRecharge], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recharge.memberId = :memberId', { memberId: 1 })
    })

    it('should apply validity status filter for active records', async () => {
      const queryDto: QueryRechargeDto = { page: 1, limit: 10, validityStatus: 'active' }
      const mockResult = [[mockRecharge], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recharge.endDate > :now', { now: expect.any(Date) })
    })

    it('should apply validity status filter for expired records', async () => {
      const queryDto: QueryRechargeDto = { page: 1, limit: 10, validityStatus: 'expired' }
      const mockResult = [[mockRecharge], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recharge.endDate <= :now', { now: expect.any(Date) })
    })

    it('should apply amount range filter', async () => {
      const queryDto: QueryRechargeDto = {
        page: 1,
        limit: 10
      }
      const mockResult = [[mockRecharge], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recharge.rechargeAmount >= :minAmount', { minAmount: 500 })
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('recharge.rechargeAmount <= :maxAmount', { maxAmount: 2000 })
    })
  })

  describe('findOne', () => {
    it('should return a recharge record by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockRecharge)

      const result = await service.findOne(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['member', 'package', 'operator']
      })
      expect(result).toEqual(mockRecharge)
    })

    it('should throw NotFoundException when recharge record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a recharge record successfully', async () => {
      const updateRechargeDto: UpdateRechargeDto = {
        remark: '更新后的备注',
        state: 'inactive',
      }

      const updatedRecharge = { ...mockRecharge, ...updateRechargeDto }

      mockRepository.findOne.mockResolvedValue(mockRecharge)
      mockRepository.save.mockResolvedValue(updatedRecharge)

      const result = await service.update(1, updateRechargeDto)

      expect(result).toEqual(updatedRecharge)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should recalculate total amount when recharge or bonus amount is updated', async () => {
      const updateRechargeDto: UpdateRechargeDto = {
        rechargeAmount: 800.00,
        bonusAmount: 80.00,
      }

      mockRepository.findOne.mockResolvedValue(mockRecharge)
      mockRepository.save.mockResolvedValue(mockRecharge)

      await service.update(1, updateRechargeDto)

      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        totalAmount: 880.00
      }))
    })

    it('should recalculate remaining times when total or used times is updated', async () => {
      const updateRechargeDto: UpdateRechargeDto = {
        totalTimes: 15,
        usedTimes: 3,
      }

      mockRepository.findOne.mockResolvedValue(mockRecharge)
      mockRepository.save.mockResolvedValue(mockRecharge)

      await service.update(1, updateRechargeDto)

      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        remainingTimes: 12
      }))
    })
  })

  describe('remove', () => {
    it('should soft delete a recharge record', async () => {
      mockRepository.findOne.mockResolvedValue(mockRecharge)
      mockRepository.softDelete.mockResolvedValue({ affected: 1 })

      await service.remove(1)

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1)
    })
  })

  describe('consumeAmount', () => {
    it('should consume amount successfully', async () => {
      const rechargeWithBalance = { ...mockRecharge, remainingAmount: 500.00 }
      const updatedRecharge = { ...rechargeWithBalance, remainingAmount: 400.00 }

      mockRepository.findOne.mockResolvedValue(rechargeWithBalance)
      mockRepository.save.mockResolvedValue(updatedRecharge)

      const result = await service.consumeAmount(1, 100.00)

      expect(result.remainingAmount).toBe(400.00)
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        remainingAmount: 400.00
      }))
    })

    it('should throw error when insufficient balance', async () => {
      const rechargeWithLowBalance = { ...mockRecharge, remainingAmount: 50.00 }

      mockRepository.findOne.mockResolvedValue(rechargeWithLowBalance)

      await expect(service.consumeAmount(1, 100.00)).rejects.toThrow('余额不足')
    })
  })

  describe('consumeTimes', () => {
    it('should consume times successfully', async () => {
      const rechargeWithTimes = { ...mockRecharge, remainingTimes: 5, usedTimes: 5 }
      const updatedRecharge = { ...rechargeWithTimes, remainingTimes: 3, usedTimes: 7 }

      mockRepository.findOne.mockResolvedValue(rechargeWithTimes)
      mockRepository.save.mockResolvedValue(updatedRecharge)

      const result = await service.consumeTimes(1, 2)

      expect(result.usedTimes).toBe(7)
      expect(result.remainingTimes).toBe(3)
    })

    it('should throw error when insufficient times', async () => {
      const rechargeWithLowTimes = { ...mockRecharge, remainingTimes: 1 }

      mockRepository.findOne.mockResolvedValue(rechargeWithLowTimes)

      await expect(service.consumeTimes(1, 2)).rejects.toThrow('剩余次数不足')
    })
  })

  describe('getStatistics', () => {
    it('should return recharge statistics', async () => {
      const mockStats = {
        totalAmount: '5000.00',
        totalCount: '5',
        averageAmount: '1000.00'
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getRawOne.mockResolvedValue(mockStats)

      const result = await service.getStatistics('2024-01-01', '2024-12-31')

      expect(result).toEqual({
        totalAmount: 5000.00,
        totalCount: 5,
        averageAmount: 1000.00
      })
    })
  })
})
