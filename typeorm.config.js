const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const { join } = require('path');

// 加载环境变量
config();

/**
 * TypeORM CLI 配置文件
 * 用于 TypeORM CLI 命令
 */
module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'member_management',

  // 实体文件路径
  entities: [
    join(__dirname, 'src', 'entities', '*.entity{.ts,.js}'),
    join(__dirname, 'dist', 'entities', '*.entity{.ts,.js}')
  ],

  // 迁移文件路径
  migrations: [
    join(__dirname, 'src', 'migrations', '*{.ts,.js}'),
    join(__dirname, 'dist', 'migrations', '*{.ts,.js}')
  ],

  // 订阅者文件路径
  subscribers: [
    join(__dirname, 'src', 'subscribers', '*{.ts,.js}'),
    join(__dirname, 'dist', 'subscribers', '*{.ts,.js}')
  ],

  // 开发环境配置
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',

  // 迁移配置
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations'
});
