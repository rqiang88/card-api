import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { join } from 'path';

console.log(join(__dirname, 'migrations', '*.ts'), '====path=====');
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5433,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  subscribers: ['src/subscribers/**/*.ts'],
  migrationsTableName: 'migrations',
});



export default AppDataSource;