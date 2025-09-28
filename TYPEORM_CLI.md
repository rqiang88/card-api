# TypeORM CLI 使用指南

本项目已配置 TypeORM CLI 支持，迁移文件保存在 `src/migrate` 目录。

## 🚀 快速开始

### 1. 环境准备

确保 `.env` 文件包含数据库配置：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=member_management
```

### 2. 安装依赖

```bash
yarn install
```

## 📋 可用命令

### 迁移管理

```bash
# 🔄 生成迁移文件（根据实体变化自动生成）
yarn migration:generate src/migrate/DescriptiveName

# 📝 创建空的迁移文件
yarn migration:create src/migrate/DescriptiveName

# ▶️ 运行所有待执行的迁移
yarn migration:run

# ◀️ 回滚最后一次迁移
yarn migration:revert

# 📊 查看迁移状态
yarn migration:show
```

### 数据库结构管理

```bash
# 🔄 同步数据库结构（仅开发环境）
yarn schema:sync

# 🗑️ 删除所有表（危险操作）
yarn schema:drop
```

### 数据填充

```bash
# 🌱 运行种子数据
yarn seed
```

## 📁 项目结构

```
backend/
├── src/
│   ├── migrate/                 # 迁移文件目录
│   │   ├── README.md           # 迁移使用说明
│   │   └── *.ts                # 迁移文件
│   ├── entities/               # 实体文件
│   ├── config/
│   │   ├── database.config.ts  # 数据库配置
│   │   └── typeorm.config.ts   # TypeORM CLI 配置
│   └── database/
│       └── seeds/              # 种子数据
├── typeorm.config.js           # TypeORM CLI 根配置
└── package.json                # 脚本配置
```

## 🔧 配置文件说明

### 1. typeorm.config.js (根目录)

TypeORM CLI 的主配置文件，用于命令行工具。

### 2. src/config/typeorm.config.ts

TypeScript 版本的配置文件，用于应用程序。

### 3. src/config/database.config.ts

NestJS 应用的数据库配置。

## 📝 使用示例

### 1. 创建新实体后生成迁移

```bash
# 1. 修改或创建实体文件
# 2. 生成迁移文件
yarn migration:generate src/migrate/AddEmailToUser

# 3. 查看生成的迁移文件
cat src/migrate/*-AddEmailToUser.ts

# 4. 运行迁移
yarn migration:run
```

### 2. 手动创建迁移

```bash
# 1. 创建空的迁移文件
yarn migration:create src/migrate/CreateIndexes

# 2. 编辑迁移文件
# 3. 运行迁移
yarn migration:run
```

### 3. 回滚迁移

```bash
# 查看当前迁移状态
yarn migration:show

# 回滚最后一次迁移
yarn migration:revert
```

## ⚠️ 注意事项

### 生产环境

1. **备份数据库**: 运行迁移前务必备份
2. **测试迁移**: 在测试环境先验证
3. **禁用同步**: `synchronize: false`
4. **监控日志**: 关注迁移执行日志

### 开发环境

1. **及时迁移**: 拉取代码后运行 `yarn migration:run`
2. **命名规范**: 使用描述性的迁移名称
3. **版本控制**: 迁移文件要提交到 Git
4. **冲突处理**: 小心处理迁移冲突

### 团队协作

1. **沟通协调**: 大的结构变更要提前沟通
2. **顺序执行**: 按时间顺序执行迁移
3. **文档更新**: 重要变更要更新文档
4. **代码审查**: 迁移文件也要进行代码审查

## 🐛 常见问题

### Q: 迁移文件冲突怎么办？

A: 
1. 拉取最新代码
2. 运行 `yarn migration:run`
3. 重新生成自己的迁移
4. 测试新的迁移文件

### Q: 如何修改已运行的迁移？

A: 不要修改已运行的迁移，创建新的迁移来修正：

```bash
yarn migration:generate src/migrate/FixPreviousMigration
```

### Q: 迁移运行失败怎么办？

A:
1. 检查数据库连接
2. 查看错误日志
3. 检查 SQL 语法
4. 必要时回滚迁移

### Q: 如何在迁移中处理数据？

A: 在迁移文件中可以执行数据操作：

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // 1. 修改结构
  await queryRunner.query(`ALTER TABLE "users" ADD "full_name" varchar`)
  
  // 2. 迁移数据
  await queryRunner.query(`
    UPDATE "users" 
    SET "full_name" = CONCAT("first_name", ' ', "last_name")
  `)
  
  // 3. 删除旧列
  await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`)
  await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`)
}
```

## 📚 参考资料

- [TypeORM 官方文档](https://typeorm.bootcss.com/using-cli)
- [TypeORM CLI 命令](https://typeorm.bootcss.com/using-cli#cli-commands)
- [迁移最佳实践](https://typeorm.bootcss.com/migrations)

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看 TypeORM 官方文档
2. 检查项目的 README 文件
3. 查看迁移目录的 README.md
4. 联系项目维护者
