import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from '../../entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'

describe('UsersService', () => {
  let service: UsersService
  let repository: Repository<User>

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
    validatePassword: jest.fn(),
    setPassword: jest.fn(),
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))

    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new user successfully', async () => {
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

      mockRepository.findOne.mockResolvedValue(null)
      mockRepository.create.mockReturnValue(mockUser)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.create(createUserDto)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [
          { account: createUserDto.account },
          { email: createUserDto.email }
        ]
      })
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto)
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('should throw ConflictException when account or email already exists', async () => {
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

      mockRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException)
      expect(mockRepository.create).not.toHaveBeenCalled()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findByAccount', () => {
    it('should return a user by account', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findByAccount('admin')

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { account: 'admin' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should return undefined when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      const result = await service.findByAccount('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.findOne(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return paginated users without filters', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10 }
      const mockResult = [[mockUser], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      const result = await service.findAll(queryDto)

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user')
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC')
      expect(result).toEqual({
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      })
    })

    it('should apply search filter', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, search: 'admin' }
      const mockResult = [[mockUser], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.name LIKE :search OR user.account LIKE :search OR user.email LIKE :search',
        { search: '%admin%' }
      )
    })

    it('should apply role filter', async () => {
      const queryDto: QueryUserDto = { page: 1, limit: 10, role: 'admin' }
      const mockResult = [[mockUser], 1]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue(mockResult)

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', { role: 'admin' })
    })
  })

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: '超级管理员',
        mobile: '13800138001',
      }

      const updatedUser = { ...mockUser, ...updateUserDto }

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call in update method
        .mockResolvedValueOnce(null) // Second call for checking existing account/email

      mockRepository.save.mockResolvedValue(updatedUser)

      const result = await service.update(1, updateUserDto)

      expect(result).toEqual(updatedUser)
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should handle password update using virtual field', async () => {
      const updateUserDto: UpdateUserDto = {
        newPassword: 'newPassword123',
      }

      const userWithSetPassword = {
        ...mockUser,
        setPassword: jest.fn(),
      }

      mockRepository.findOne
        .mockResolvedValueOnce(userWithSetPassword)
        .mockResolvedValueOnce(null)

      mockRepository.save.mockResolvedValue(userWithSetPassword)

      await service.update(1, updateUserDto)

      expect(userWithSetPassword.setPassword).toHaveBeenCalledWith('newPassword123')
      expect(mockRepository.save).toHaveBeenCalledWith(userWithSetPassword)
    })

    it('should throw ConflictException when account already exists for another user', async () => {
      const updateUserDto: UpdateUserDto = {
        account: 'admin2',
      }

      const anotherUser = { ...mockUser, id: 2, account: 'admin2' }

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(anotherUser)

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser)
      mockRepository.softDelete.mockResolvedValue({ affected: 1 })

      await service.remove(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.remove(999)).rejects.toThrow(NotFoundException)
      expect(mockRepository.softDelete).not.toHaveBeenCalled()
    })
  })

  describe('updateLastLoginTime', () => {
    it('should update last login time', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 })

      await service.updateLastLoginTime(1)

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        lastLoginTime: expect.any(Date)
      })
    })
  })
})
