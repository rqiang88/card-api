import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StatsService } from './stats.service'
import { Recharge } from '@/entities/recharge.entity'
import { Member } from '@/entities/member.entity'

describe('StatsService', () => {
  let service: StatsService
  let rechargeRepository: Repository<Recharge>
  let memberRepository: Repository<Member>

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getCount: jest.fn()
  }

  const mockRechargeRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  }

  const mockMemberRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder)
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(Recharge),
          useValue: mockRechargeRepository
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository
        }
      ]
    }).compile()

    service = module.get<StatsService>(StatsService)
    rechargeRepository = module.get<Repository<Recharge>>(getRepositoryToken(Recharge))
    memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getRechargeStats', () => {
    it('should return recharge statistics for today', async () => {
      const mockStats = {
        totalAmount: '1000.00',
        totalCount: '5'
      }
      mockQueryBuilder.getRawOne.mockResolvedValue(mockStats)

      const result = await service.getRechargeStats({ period: 'today' })

      expect(result.totalAmount).toBe(1000)
      expect(result.totalCount).toBe(5)
      expect(result.period).toBe('today')
    })
  })

  describe('getMemberStats', () => {
    it('should return member statistics for today', async () => {
      mockQueryBuilder.getCount.mockResolvedValueOnce(100).mockResolvedValueOnce(5)

      const result = await service.getMemberStats({ period: 'today' })

      expect(result.totalCount).toBe(100)
      expect(result.newCount).toBe(5)
      expect(result.period).toBe('today')
    })
  })
})