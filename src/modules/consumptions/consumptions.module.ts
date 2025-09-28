import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumptionService } from './consumptions.service';
import { ConsumptionController } from './consumptions.controller';
import { Consumption } from '../../entities/consumption.entity';
import { Recharge } from '../../entities/recharge.entity';
import { Member } from '../../entities/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consumption, Recharge, Member]),
    forwardRef(() => import('../recharges/recharges.module').then(m => m.RechargesModule))
  ],
  controllers: [ConsumptionController],
  providers: [ConsumptionService],
  exports: [ConsumptionService]
})
export class ConsumptionModule {}
