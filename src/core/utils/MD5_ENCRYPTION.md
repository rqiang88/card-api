# MD5 密码加密说明

本项目使用 MD5 算法进行密码加密，以下是详细说明。

## 🔐 加密方式

### MD5 + 盐值加密

```typescript
// 默认盐值
private static readonly DEFAULT_SALT = 'member_management_system_salt_2024'

// 加密过程
const saltedPassword = password + salt
const hashedPassword = crypto.createHash('md5').update(saltedPassword).digest('hex')
```

### 特点

- **固定长度**: MD5 哈希始终为 32 位十六进制字符
- **确定性**: 相同密码 + 相同盐值 = 相同哈希
- **不可逆**: 无法从哈希值反推原密码
- **快速**: 计算速度快，适合高并发场景

## 🛠️ API 使用

### 基本用法

```typescript
import { CryptoUtil } from '@/core/utils'

// 加密密码
const hashedPassword = CryptoUtil.hashPassword('myPassword123')
console.log(hashedPassword) // 32位十六进制字符串

// 验证密码
const isValid = CryptoUtil.comparePassword('myPassword123', hashedPassword)
console.log(isValid) // true
```

### 自定义盐值

```typescript
// 使用自定义盐值
const customSalt = 'my_custom_salt'
const hashedPassword = CryptoUtil.hashPassword('myPassword123', customSalt)

// 验证时也要使用相同盐值
const isValid = CryptoUtil.comparePassword('myPassword123', hashedPassword, customSalt)
```

### 生成随机盐值

```typescript
// 生成32字节(64位十六进制)随机盐值
const salt = CryptoUtil.generateSalt()

// 生成自定义长度盐值
const shortSalt = CryptoUtil.generateSalt(16) // 16字节 = 32位十六进制
```

## 🏗️ 实体中的使用

### User 实体自动加密

```typescript
// 创建用户 - 通过虚拟字段
const user = new User()
user.username = 'admin'
user.passwordRaw = 'plainPassword' // 虚拟字段

await userRepository.save(user) // 自动加密

console.log(user.password) // 32位MD5哈希
console.log(user.passwordRaw) // undefined (已清空)
```

### 密码验证

```typescript
// 登录验证
const user = await userRepository.findOne({ where: { username: 'admin' } })
const isValid = user.validatePassword('plainPassword')

if (isValid) {
  console.log('登录成功')
} else {
  console.log('密码错误')
}
```

## 🔍 哈希格式识别

### MD5 哈希特征

- **长度**: 固定 32 位
- **字符**: 只包含 0-9 和 a-f
- **格式**: 小写十六进制

```typescript
// 检查是否为MD5哈希
function isMD5Hash(str: string): boolean {
  return /^[a-f0-9]{32}$/.test(str)
}

// 示例
console.log(isMD5Hash('e10adc3949ba59abbe56e057f20f883e')) // true (123456的MD5)
console.log(isMD5Hash('invalid_hash')) // false
```

## 📊 常见密码的 MD5 值

以下是使用默认盐值的常见密码 MD5 值：

```typescript
// 注意：这些值包含了系统盐值，实际值会不同
CryptoUtil.hashPassword('123456')    // 具体值取决于盐值
CryptoUtil.hashPassword('admin')     // 具体值取决于盐值
CryptoUtil.hashPassword('password')  // 具体值取决于盐值
```

## ⚠️ 安全注意事项

### 1. 盐值管理

```typescript
// ✅ 推荐：使用系统默认盐值
const hash = CryptoUtil.hashPassword('password')

// ⚠️ 注意：自定义盐值要妥善保管
const customHash = CryptoUtil.hashPassword('password', 'custom_salt')
```

### 2. 密码强度

```typescript
// 检查密码强度
const result = CryptoUtil.checkPasswordStrength('myPassword123!')
if (!result.isValid) {
  console.log('密码强度不足:', result.feedback)
}
```

### 3. 防止彩虹表攻击

- 使用盐值增强安全性
- 盐值应该足够长且随机
- 不同系统使用不同盐值

## 🔄 从 bcrypt 迁移

如果从 bcrypt 迁移到 MD5，需要注意：

### 1. 识别旧密码

```typescript
// bcrypt 哈希特征
function isBcryptHash(str: string): boolean {
  return str.startsWith('$2b$') || str.startsWith('$2a$')
}

// MD5 哈希特征
function isMD5Hash(str: string): boolean {
  return /^[a-f0-9]{32}$/.test(str)
}
```

### 2. 渐进式迁移

```typescript
// 在用户登录时逐步迁移
async function migratePassword(user: User, plainPassword: string) {
  if (isBcryptHash(user.password)) {
    // 验证旧密码
    const isValid = await bcrypt.compare(plainPassword, user.password)
    if (isValid) {
      // 更新为MD5
      user.passwordRaw = plainPassword
      await userRepository.save(user)
    }
  }
}
```

## 🧪 测试

### 单元测试示例

```typescript
describe('MD5 Encryption', () => {
  it('should generate consistent hash', () => {
    const password = 'testPassword123'
    const hash1 = CryptoUtil.hashPassword(password)
    const hash2 = CryptoUtil.hashPassword(password)
    
    expect(hash1).toBe(hash2) // MD5 应该产生相同结果
    expect(hash1.length).toBe(32) // 长度应该是32
    expect(/^[a-f0-9]{32}$/.test(hash1)).toBe(true) // 格式检查
  })

  it('should validate password correctly', () => {
    const password = 'testPassword123'
    const hash = CryptoUtil.hashPassword(password)
    
    expect(CryptoUtil.comparePassword(password, hash)).toBe(true)
    expect(CryptoUtil.comparePassword('wrongPassword', hash)).toBe(false)
  })
})
```

## 📈 性能对比

| 算法 | 加密速度 | 安全性 | 哈希长度 | 用途 |
|------|----------|--------|----------|------|
| MD5 | 很快 | 中等 | 32字符 | 一般应用 |
| bcrypt | 慢 | 高 | 60字符 | 高安全要求 |
| SHA-256 | 快 | 高 | 64字符 | 数据完整性 |

## 🔧 配置

### 修改默认盐值

```typescript
// 在 CryptoUtil 类中修改
private static readonly DEFAULT_SALT = 'your_custom_salt_here'
```

### 环境变量配置

```env
# .env 文件
CRYPTO_SALT=your_production_salt_here
```

```typescript
// 使用环境变量
private static readonly DEFAULT_SALT = process.env.CRYPTO_SALT || 'fallback_salt'
```

## 📚 参考资料

- [MD5 算法说明](https://en.wikipedia.org/wiki/MD5)
- [Node.js Crypto 模块](https://nodejs.org/api/crypto.html)
- [密码安全最佳实践](https://owasp.org/www-project-cheat-sheets/cheatsheets/Password_Storage_Cheat_Sheet.html)
