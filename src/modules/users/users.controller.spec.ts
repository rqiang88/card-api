import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'

describe('UsersController', () => {
  let controller: UsersController
  let service: UsersService

  const mockUser = {
    id: 1,
    name: '管理员',
    account: 'admin',
    gender: 'male',
    password: 'hashedPassword',
    email: 'admin@example.com',
    mobile: '13800138000',
    role: 'admin',
    state: 'active',
    lastLoginAt: new Date(),
    payload: '{}',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByAccount: jest.fn(),
    updateLastLoginTime: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: '管理员',
        account: 'admin',
        gender: 'male',
        password: 'password123',
        email: 'admin@example.com',
        mobile: '13800138000',
        role: 'admin',
        state: 'active',
      }

      mockUsersService.create.mockResolvedValue(mockUser)

      const result = await controller.create(createUserDto)

      expect(service.create).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(mockUser)
    })

    it('should handle ConflictException when account or email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: '管理员',
        account: 'admin',
        gender: 'male',
        password: 'password123',
        email: 'admin@example.com',
        mobile: '13800138000',
        role: 'admin',
        state: 'active',
      }

      mockUsersService.create.mockRejectedValue(new ConflictException('账号或邮箱已存在'))

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException)
      expect(service.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10 }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle search query', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, search: 'admin' }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle role filter', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, role: 'admin' }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle state filter', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, state: 'active' }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle gender filter', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, gender: 'male' }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser)

      const result = await controller.findOne('1')

      expect(service.findOne).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockUser)
    })

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('用户 ID 999 不存在'))

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException)
      expect(service.findOne).toHaveBeenCalledWith(999)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: '超级管理员',
        mobile: '13800138001',
      }

      const updatedUser = { ...mockUser, ...updateUserDto }

      mockUsersService.update.mockResolvedValue(updatedUser)

      const result = await controller.update('1', updateUserDto)

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto)
      expect(result).toEqual(updatedUser)
    })

    it('should handle password update', async () => {
      const updateUserDto: UpdateUserDto = {
        newPassword: 'newPassword123',
      }

      const updatedUser = { ...mockUser }

      mockUsersService.update.mockResolvedValue(updatedUser)

      const result = await controller.update('1', updateUserDto)

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto)
      expect(result).toEqual(updatedUser)
    })

    it('should handle NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = { name: '超级管理员' }

      mockUsersService.update.mockRejectedValue(new NotFoundException('用户 ID 999 不存在'))

      await expect(controller.update('999', updateUserDto)).rejects.toThrow(NotFoundException)
      expect(service.update).toHaveBeenCalledWith(999, updateUserDto)
    })

    it('should handle ConflictException when account already exists', async () => {
      const updateUserDto: UpdateUserDto = { account: 'admin2' }

      mockUsersService.update.mockRejectedValue(new ConflictException('账号或邮箱已存在'))

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(ConflictException)
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto)
    })
  })

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined)

      await controller.remove('1')

      expect(service.remove).toHaveBeenCalledWith(1)
    })

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('用户 ID 999 不存在'))

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException)
      expect(service.remove).toHaveBeenCalledWith(999)
    })
  })

  describe('parameter validation', () => {
    it('should convert string id to number', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser)

      await controller.findOne('123')

      expect(service.findOne).toHaveBeenCalledWith(123)
    })

    it('should handle invalid id format', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser)

      await controller.findOne('abc')

      // NaN will be passed to service, which should handle it appropriately
      expect(service.findOne).toHaveBeenCalledWith(NaN)
    })
  })

  describe('response format', () => {
    it('should return proper response format for create', async () => {
      const createUserDto: CreateUserDto = {
        name: '管理员',
        account: 'admin',
        gender: 'male',
        password: 'password123',
        email: 'admin@example.com',
        mobile: '13800138000',
        role: 'admin',
        state: 'active',
      }

      mockUsersService.create.mockResolvedValue(mockUser)

      const result = await controller.create(createUserDto)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('account')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('role')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })

    it('should return proper response format for findAll', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10 }
      const expectedResult = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }

      mockUsersService.findAll.mockResolvedValue(expectedResult)

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
