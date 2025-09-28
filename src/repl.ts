import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';
import * as repl from 'repl';

// 导入所有服务
import { UsersService } from './modules/users/users.service';
import { MembersService } from './modules/members/members.service';
import { PackagesService } from './modules/packages/packages.service';
import { ConsumptionService } from './modules/consumptions/consumptions.service';
import { RechargesService } from './modules/recharges/recharges.service';
import { AuthService } from './modules/auth/auth.service';

async function startRepl() {
  // 1. 初始化 nestjs-console 无头应用
  const bootstrap = new BootstrapConsole({
    module: AppModule,
    useDecorators: true, // 启用装饰器（如果使用 @Console/@Command）
  });
  const app = await bootstrap.init(); // 获取 NestApplicationContext
  await app.init();

  // 2. 创建 REPL 服务器
  const replServer = repl.start({
    prompt: 'nest-repl > ', // 自定义提示符
    useColors: true,
    useGlobal: false,
    ignoreUndefined: true,
  });

  // 3. 注入 Nest 服务到 REPL 上下文
  try {
    replServer.context.app = app;

    // 获取并注入所有服务
    replServer.context.usersService = app.get(UsersService);
    replServer.context.membersService = app.get(MembersService);
    replServer.context.packagesService = app.get(PackagesService);
    replServer.context.consumptionService = app.get(ConsumptionService);
    replServer.context.rechargesService = app.get(RechargesService);
    replServer.context.authService = app.get(AuthService);

    console.log('✅ 所有服务已成功注入到 REPL 上下文');
  } catch (error) {
    console.error('❌ 服务注入失败:', error.message);
  }

  // 4. 添加帮助信息和工具函数
  replServer.context.help = () => {
    console.log('\n📚 可用服务和命令：');
    console.log('='.repeat(50));
    console.log('🔧 usersService     - 用户管理服务');
    console.log('👥 membersService   - 会员管理服务');
    console.log('📦 packagesService  - 套餐管理服务');
    console.log('💰 consumptionService - 消费记录服务');
    console.log('💳 rechargeService  - 充值记录服务');
    console.log('🔐 authService      - 认证服务');
    console.log('🏗️  app             - NestJS 应用上下文');
    console.log('\n💡 示例用法：');
    console.log('  await usersService.findAll({})');
    console.log('  await membersService.findAll({})');
    console.log('  listMethods(usersService)');
    console.log('  describe(membersService)');
    console.log('\n🛠️  工具函数：');
    console.log('  help()              - 显示此帮助信息');
    console.log('  listMethods(service) - 列出服务的所有方法');
    console.log('  describe(service)    - 显示服务详细信息');
    console.log('\n⚠️  输入 .exit 退出 REPL\n');
  };

  replServer.context.listMethods = (service: any) => {
    if (!service) {
      console.log('❌ 请提供一个服务对象');
      return;
    }
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
      .filter(name => name !== 'constructor' && typeof service[name] === 'function');
    console.log(`\n📋 ${service.constructor.name} 的方法列表:`);
    console.log('='.repeat(40));
    methods.forEach(method => console.log(`  • ${method}()`));
    console.log('');
  };

  replServer.context.describe = (service: any) => {
    if (!service) {
      console.log('❌ 请提供一个服务对象');
      return;
    }

    const className = service.constructor.name;
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
      .filter(name => name !== 'constructor' && typeof service[name] === 'function');

    console.log(`\n📖 服务详情: ${className}`);
    console.log('='.repeat(50));
    console.log(`📝 类名: ${className}`);
    console.log(`🔧 方法数量: ${methods.length}`);
    console.log('📋 方法列表:');
    methods.forEach(method => {
      console.log(`  • ${method}()`);
    });
    console.log('');
  };

  // 5. 显示启动信息
  console.log('\n🚀 NestJS REPL 已启动!');
  console.log('💡 输入 help() 查看可用命令和服务');
  console.log('⚠️  输入 .exit 退出 REPL\n');

  // 6. 处理 REPL 退出
  replServer.on('exit', () => {
    console.log('\n👋 退出 REPL');
    process.exit(0);
  });

  // 7. 处理错误
  replServer.on('error', (err) => {
    console.error('❌ REPL 错误:', err);
  });
}

startRepl().catch((err) => console.error('❌ REPL 启动失败：', err));
