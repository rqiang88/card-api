import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'
import { Recharge } from '@/entities/recharge.entity'
import { Member } from '@/entities/member.entity'
import { Package } from '@/entities/package.entity'
import { Consumption } from '@/entities/consumption.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Recharge, Member, Package, Consumption])
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}