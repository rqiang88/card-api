import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargesService } from './recharges.service';
import { RechargesController } from './recharges.controller';
import { Recharge } from '@/entities/recharge.entity';
import { Package } from '@/entities/package.entity';
import { Consumption } from '@/entities/consumption.entity';
import { ConsumptionModule } from '../consumptions/consumptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recharge, Package, Consumption]),
    forwardRef(() => ConsumptionModule)
  ],
  controllers: [RechargesController],
  providers: [RechargesService],
  exports: [RechargesService],
})
export class RechargesModule {}
