# 后端开发文档

## 项目概述
会员管理系统后端API，基于NestJS框架开发，使用TypeORM作为ORM，PostgreSQL作为数据库。

## 技术栈
- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **测试**: Jest
- **API文档**: Swagger

## 开发规范

### 代码生成规则

#### 1. 模块结构
每个业务模块应包含以下文件：
```
src/modules/[module-name]/
├── [module-name].controller.ts     # 控制器
├── [module-name].service.ts        # 服务层
├── [module-name].module.ts         # 模块定义
├── dto/                            # 数据传输对象
│   ├── create-[module-name].dto.ts
│   └── update-[module-name].dto.ts
├── entities/                       # 实体（如果不使用全局entities）
└── tests/                          # 测试文件
    ├── [module-name].controller.spec.ts
    └── [module-name].service.spec.ts
```

#### 2. 测试代码生成要求

**重要：生成代码时必须同步生成测试代码**

- **Controller测试**: 必须为每个Controller生成对应的`.spec.ts`测试文件
- **Service测试**: 必须为每个Service生成对应的`.spec.ts`测试文件
- **其他组件**: DTO、Entity、Guard等不需要生成测试代码

#### 3. 测试文件命名规范
- Controller测试: `[module-name].controller.spec.ts`
- Service测试: `[module-name].service.spec.ts`

#### 4. 测试覆盖要求
- **Controller测试**:
  - 测试所有HTTP端点
  - 测试请求参数验证
  - 测试响应格式
  - 测试错误处理
  - 测试权限验证

- **Service测试**:
  - 测试所有公共方法
  - 测试业务逻辑
  - 测试数据库操作
  - 测试异常处理
  - Mock外部依赖

### 测试框架配置

#### Jest配置
项目使用Jest作为测试框架，配置在`package.json`中：

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

#### 测试命令
```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:cov

# 调试模式运行测试
npm run test:debug

# 运行E2E测试
npm run test:e2e
```

### 测试编写指南

#### 1. Controller测试模板
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { [ModuleName]Controller } from './[module-name].controller';
import { [ModuleName]Service } from './[module-name].service';

describe('[ModuleName]Controller', () => {
  let controller: [ModuleName]Controller;
  let service: [ModuleName]Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [[ModuleName]Controller],
      providers: [
        {
          provide: [ModuleName]Service,
          useValue: {
            // Mock methods
          },
        },
      ],
    }).compile();

    controller = module.get<[ModuleName]Controller>([ModuleName]Controller);
    service = module.get<[ModuleName]Service>([ModuleName]Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 测试各个端点
});
```

#### 2. Service测试模板
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { [ModuleName]Service } from './[module-name].service';
import { [Entity] } from '../../entities/[entity].entity';

describe('[ModuleName]Service', () => {
  let service: [ModuleName]Service;
  let repository: Repository<[Entity]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [ModuleName]Service,
        {
          provide: getRepositoryToken([Entity]),
          useValue: {
            // Mock repository methods
          },
        },
      ],
    }).compile();

    service = module.get<[ModuleName]Service>([ModuleName]Service);
    repository = module.get<Repository<[Entity]>>(getRepositoryToken([Entity]));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 测试各个方法
});
```

### 开发流程

1. **创建模块**: 使用NestJS CLI生成基础模块结构
2. **编写业务代码**: 实现Controller和Service
3. **同步编写测试**: 为Controller和Service编写对应测试
4. **运行测试**: 确保所有测试通过
5. **代码审查**: 检查代码质量和测试覆盖率

### 注意事项

1. **必须编写测试**: 任何新增的Controller和Service都必须有对应的测试文件
2. **测试覆盖率**: 目标覆盖率应达到80%以上
3. **Mock依赖**: 测试中应Mock所有外部依赖
4. **测试隔离**: 每个测试应该独立，不依赖其他测试的结果
5. **测试命名**: 测试描述应该清晰明确，说明测试的具体场景

## 参考文档

- [NestJS官方文档](https://docs.nestjs.com/)
- [NestJS测试文档](https://docs.nestjs.cn/fundamentals/unit-testing)
- [Jest官方文档](https://jestjs.io/docs/getting-started)
- [TypeORM官方文档](https://typeorm.io/)
