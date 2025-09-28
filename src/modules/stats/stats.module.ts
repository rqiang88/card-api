import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'
import { Recharge } from '@/entities/recharge.entity'
import { Member } from '@/entities/member.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Recharge, Member])
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}