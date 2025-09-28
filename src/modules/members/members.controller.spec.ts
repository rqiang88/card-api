import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { MembersController } from './members.controller'
import { MembersService } from './members.service'
import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'
import { QueryMemberDto } from './dto/query-member.dto'

describe('MembersController', () => {
  let controller: MembersController
  let service: MembersService

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

  const mockMembersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile()

    controller = module.get<MembersController>(MembersController)
    service = module.get<MembersService>(MembersService)

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a new member', async () => {
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

      mockMembersService.create.mockResolvedValue(mockMember)

      const result = await controller.create(createMemberDto)

      expect(service.create).toHaveBeenCalledWith(createMemberDto)
      expect(result).toEqual(mockMember)
    })

    it('should handle ConflictException when phone already exists', async () => {
      const createMemberDto: CreateMemberDto = {
        name: '张三',
        phone: '13800138000',
      }

      mockMembersService.create.mockRejectedValue(new ConflictException('手机号已存在'))

      await expect(controller.create(createMemberDto)).rejects.toThrow(ConflictException)
      expect(service.create).toHaveBeenCalledWith(createMemberDto)
    })
  })

  describe('findAll', () => {
    it('should return paginated members', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10 }
      const expectedResult = {
        items: [mockMember],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockMembersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle search query', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, search: '张三' }
      const expectedResult = {
        items: [mockMember],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockMembersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle level filter', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, level: 'vip' }
      const expectedResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }

      mockMembersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle state filter', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10, state: 'active' }
      const expectedResult = {
        items: [mockMember],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockMembersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findOne', () => {
    it('should return a member by id', async () => {
      mockMembersService.findOne.mockResolvedValue(mockMember)

      const result = await controller.findOne('1')

      expect(service.findOne).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockMember)
    })

    it('should handle NotFoundException when member not found', async () => {
      mockMembersService.findOne.mockRejectedValue(new NotFoundException('会员 ID 999 不存在'))

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException)
      expect(service.findOne).toHaveBeenCalledWith(999)
    })
  })

  describe('update', () => {
    it('should update a member', async () => {
      const updateMemberDto: UpdateMemberDto = {
        name: '李四',
        email: 'lisi@example.com',
      }

      const updatedMember = { ...mockMember, ...updateMemberDto }

      mockMembersService.update.mockResolvedValue(updatedMember)

      const result = await controller.update('1', updateMemberDto)

      expect(service.update).toHaveBeenCalledWith(1, updateMemberDto)
      expect(result).toEqual(updatedMember)
    })

    it('should handle NotFoundException when member not found', async () => {
      const updateMemberDto: UpdateMemberDto = { name: '李四' }

      mockMembersService.update.mockRejectedValue(new NotFoundException('会员 ID 999 不存在'))

      await expect(controller.update('999', updateMemberDto)).rejects.toThrow(NotFoundException)
      expect(service.update).toHaveBeenCalledWith(999, updateMemberDto)
    })

    it('should handle ConflictException when phone already exists', async () => {
      const updateMemberDto: UpdateMemberDto = { phone: '13800138001' }

      mockMembersService.update.mockRejectedValue(new ConflictException('手机号已存在'))

      await expect(controller.update('1', updateMemberDto)).rejects.toThrow(ConflictException)
      expect(service.update).toHaveBeenCalledWith(1, updateMemberDto)
    })
  })

  describe('remove', () => {
    it('should remove a member', async () => {
      mockMembersService.remove.mockResolvedValue(undefined)

      await controller.remove('1')

      expect(service.remove).toHaveBeenCalledWith(1)
    })

    it('should handle NotFoundException when member not found', async () => {
      mockMembersService.remove.mockRejectedValue(new NotFoundException('会员 ID 999 不存在'))

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException)
      expect(service.remove).toHaveBeenCalledWith(999)
    })
  })

  describe('parameter validation', () => {
    it('should convert string id to number', async () => {
      mockMembersService.findOne.mockResolvedValue(mockMember)

      await controller.findOne('123')

      expect(service.findOne).toHaveBeenCalledWith(123)
    })

    it('should handle invalid id format', async () => {
      mockMembersService.findOne.mockResolvedValue(mockMember)

      await controller.findOne('abc')

      // NaN will be passed to service, which should handle it appropriately
      expect(service.findOne).toHaveBeenCalledWith(NaN)
    })
  })

  describe('response format', () => {
    it('should return proper response format for create', async () => {
      const createMemberDto: CreateMemberDto = {
        name: '张三',
        phone: '13800138000',
      }

      mockMembersService.create.mockResolvedValue(mockMember)

      const result = await controller.create(createMemberDto)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('phone')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })

    it('should return proper response format for findAll', async () => {
      const queryDto: QueryMemberDto = { page: 1, limit: 10 }
      const expectedResult = {
        items: [mockMember],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockMembersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('limit')
      expect(result).toHaveProperty('totalPages')
      expect(Array.isArray(result.items)).toBe(true)
    })
  })
})
