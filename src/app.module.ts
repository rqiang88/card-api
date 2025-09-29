import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConsoleModule } from 'nestjs-console';

import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
// import { AuthGuard } from './core/guards/auth.guard';
// 共享模块
import { SharedModule } from './shared/shared.module';
// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ConsumptionModule } from './modules/consumptions/consumptions.module';
import { RechargesModule } from './modules/recharges/recharges.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import Configuration from './config/configuration';


@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('db'),
      inject: [ConfigService],
    }),
    // 共享模块
    SharedModule,
    // 业务模块
    AuthModule,
    UsersModule,
    MembersModule,
    PackagesModule,
    ConsumptionModule,
    RechargesModule,
    StatsModule,
    ConsoleModule
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    // 其他提供者...
  ]
})
export class AppModule {}
