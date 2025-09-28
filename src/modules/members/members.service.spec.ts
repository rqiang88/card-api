import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { MembersService } from './members.service'
import { Member } from '../../entities/member.entity'
import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'
import { QueryMemberDto } from './dto/query-member.dto'

describe('MembersService', () => {
  let service: MembersService
  let repository: Repository<Member>

  const mockMember = {
    id: 1,
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    gender: 'male',
    birthday: new Date('1990-01-01'),
    level: 'normal',
    balance: 100.00,
    points: 50,
    state: 'active',
    avatar: { url: 'avatar.jpg' },
    registerAt: new Date(),
    payload: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    consumptionRecords: [],
    rechargeRecords: [],
  }

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<MembersService>(MembersService)
    repository = module.get<Repository<Member>>(getRepositoryToken(Member))

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new member successfully', async () => {
      const createMemberDto: CreateMemberDto = {
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        gender: 'male',
        birthday: '1990-01-01',
        level: 'normal',
        balance: 100.00,
        points: 50,
      }

      mockRepository.findOne.mockResolvedValue(null)
      mockRepository.create.mockReturnValue(mockMember)
      mockRepository.save.mockResolvedValue(mockMember)

      const result = await service.create(createMemberDto)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: createMemberDto.phone }
      })
      expect(mockRepository.create).toHaveBeenCalledWith(createMemberDto)
      expect(mockRepository.save).toHaveBeenCalledWith(mockMember)
      expect(result).toEqual(mockMember)
    })

    it('should throw ConflictException when phone already exists', async () => {
      const createMemberDto: CreateMemberDto = {
        name: '张三',
        phone: '13800138000',
      }

      mockRepository.findOne.mockResolvedValue(mockMember)

      await expect(service.create(createMemberDto)).rejects.toThrow(ConflictException)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: createMemberDto.phone }
      })
      expect(mockRepository.create).not.toHaveBeenCalled()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return paginated members without filters', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10 }
      const mockResult = [[mockMember], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      const result = await service.findAll(queryDto)

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('member')
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('member.createdAt', 'DESC')
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0)
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10)
      expect(result).toEqual({
        items: [mockMember],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      })
    })

    it('should apply search filter', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, search: '张三' }
      const mockResult = [[mockMember], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'member.name LIKE :search OR member.phone LIKE :search',
        { search: '%张三%' }
      )
    })

    it('should apply level filter', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, level: 'vip' }
      const mockResult = [[mockMember], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('member.level = :level', { level: 'vip' })
    })

    it('should apply state filter', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, state: 'active' }
      const mockResult = [[mockMember], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('member.state = :state', { state: 'active' })
    })
  })

  describe('findOne', () => {
    it('should return a member by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMember)

      const result = await service.findOne(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['consumptionRecords', 'rechargeRecords', 'consumptionRecords.package', 'rechargeRecords.package']
      })
      expect(result).toEqual(mockMember)
    })

    it('should throw NotFoundException when member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['consumptionRecords', 'rechargeRecords', 'consumptionRecords.package', 'rechargeRecords.package']
      })
    })
  })

  describe('update', () => {
    it('should update a member successfully', async () => {
      const updateMemberDto: UpdateMemberDto = {
        name: '李四',
        email: 'lisi@example.com',
      }

      const updatedMember = { ...mockMember, ...updateMemberDto }

      // Mock findOne for the initial check
      mockRepository.findOne
        .mockResolvedValueOnce(mockMember) // First call in update method
        .mockResolvedValueOnce(null) // Second call for checking existing phone/email

      mockRepository.save.mockResolvedValue(updatedMember)

      const result = await service.update(1, updateMemberDto)

      expect(result).toEqual(updatedMember)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should throw ConflictException when phone already exists for another member', async () => {
      const updateMemberDto: UpdateMemberDto = {
        phone: '13800138001',
      }

      const anotherMember = { ...mockMember, id: 2, phone: '13800138001' }

      mockRepository.findOne
        .mockResolvedValueOnce(mockMember) // First call in update method
        .mockResolvedValueOnce(anotherMember) // Second call for checking existing phone

      await expect(service.update(1, updateMemberDto)).rejects.toThrow(ConflictException)
    })

    it('should throw NotFoundException when member not found', async () => {
      const updateMemberDto: UpdateMemberDto = { name: '李四' }

      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.update(999, updateMemberDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should soft delete a member', async () => {
      mockRepository.findOne.mockResolvedValue(mockMember)
      mockRepository.softDelete.mockResolvedValue({ affected: 1 })

      await service.remove(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['consumptionRecords', 'rechargeRecords', 'consumptionRecords.package', 'rechargeRecords.package']
      })
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException when member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.remove(999)).rejects.toThrow(NotFoundException)
      expect(mockRepository.softDelete).not.toHaveBeenCalled()
    })
  })
})
