import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Package } from '@/entities/package.entity';
import { Recharge } from '@/entities/recharge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, Recharge])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
