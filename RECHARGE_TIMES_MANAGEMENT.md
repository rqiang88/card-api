# 充值记录次数统计管理

## 功能概述

本系统实现了充值记录次数统计的自动管理功能，确保充值记录的已使用次数和剩余次数与实际的消费记录保持同步。

## 核心功能

### 1. 自动同步机制

- **创建消费记录时**：自动更新关联充值记录的次数统计
- **更新消费记录时**：如果充值ID发生变化，会同时更新新旧充值记录的次数统计
- **删除消费记录时**：自动更新关联充值记录的次数统计

### 2. 手动重置功能

#### 单个充值记录重置
```http
POST /consumption/reset-recharge-times/{rechargeId}
```

#### 批量重置所有充值记录
```http
POST /consumption/reset-all-recharge-times
```

#### 验证充值记录次数统计
```http
GET /consumption/verify-recharge-times/{rechargeId}
```

### 3. Recharge 实体方法

#### resetTimesCount()
重新计算已使用次数和剩余次数
```typescript
recharge.resetTimesCount()
```

#### hasRemainingTimes()
检查是否还有剩余次数
```typescript
if (recharge.hasRemainingTimes()) {
  // 可以继续消费
}
```

#### isInValidityPeriod()
检查是否在有效期内
```typescript
if (recharge.isInValidityPeriod()) {
  // 在有效期内
}
```

#### canConsume()
检查是否可以消费（综合检查）
```typescript
if (recharge.canConsume()) {
  // 可以消费
}
```

## 使用示例

### 1. 创建消费记录
```typescript
// 创建消费记录时会自动更新充值记录次数
const consumption = await consumptionService.create({
  memberId: 1,
  rechargeId: 5, // 关联的充值记录ID
  customerName: '张三',
  customerPhone: '13800138000',
  packageId: 1,
  amount: 100,
  paymentType: 'balance',
  seq: 'CONS20241201001',
  state: '1',
  consumptionAt: new Date(),
  operatorId: 1,
  remark: '正常消费',
  payload: {}
})
```

### 2. 手动重置充值记录次数
```typescript
// 重置单个充值记录
await consumptionService.resetRechargeTimesCount(5)

// 批量重置所有充值记录
const result = await consumptionService.resetAllRechargeTimesCount()
console.log(result.message) // "成功重置 X 条充值记录的次数统计"
```

### 3. 验证充值记录次数统计
```typescript
// 验证单个充值记录的次数统计是否正确
const verification = await consumptionService.verifyRechargeTimesCount(5)
console.log(verification.message) // "次数统计正确" 或错误信息
console.log(verification.isCorrect) // true 或 false
```

### 4. 检查充值记录状态
```typescript
const recharge = await rechargeRepository.findOne({
  where: { id: 5 },
  relations: ['consumptionRecords']
})

// 重置次数统计
recharge.resetTimesCount()

// 检查是否可以消费
if (recharge.canConsume()) {
  console.log('可以消费，剩余次数:', recharge.remainingTimes)
} else {
  console.log('不能消费，原因可能是：')
  if (!recharge.isInValidityPeriod()) {
    console.log('- 已过期')
  }
  if (!recharge.hasRemainingTimes()) {
    console.log('- 次数已用完')
  }
  if (recharge.state !== '1') {
    console.log('- 状态异常')
  }
}
```

## 数据一致性保证

### 1. 自动同步
- 每次消费记录的增删改操作都会自动触发充值记录次数统计的更新
- 确保数据的一致性和准确性

### 2. 手动修复
- 提供手动重置功能，用于修复可能的数据不一致问题
- 支持单个和批量重置操作

### 3. 数据验证
- 提供验证功能，检查充值记录的次数统计是否正确
- 可以及时发现和修复数据不一致问题

### 4. 状态检查
- 提供多种状态检查方法，确保业务逻辑的正确性
- 支持有效期、剩余次数、状态等多维度检查

## 注意事项

1. **性能考虑**：批量重置操作会遍历所有充值记录，建议在业务低峰期执行
2. **数据备份**：执行批量重置前建议先备份数据库
3. **权限控制**：重置操作应该限制为管理员权限
4. **日志记录**：建议记录所有重置操作的日志，便于问题追踪
5. **数据验证**：建议定期运行验证功能，确保数据一致性

## API 接口

### 重置单个充值记录次数
- **URL**: `POST /consumption/reset-recharge-times/{rechargeId}`
- **参数**: `rechargeId` - 充值记录ID
- **返回**: 操作结果

### 批量重置所有充值记录次数
- **URL**: `POST /consumption/reset-all-recharge-times`
- **参数**: 无
- **返回**: 
```json
{
  "success": true,
  "message": "成功重置 X 条充值记录的次数统计",
  "updatedCount": 10
}
```

### 验证充值记录次数统计
- **URL**: `GET /consumption/verify-recharge-times/{rechargeId}`
- **参数**: `rechargeId` - 充值记录ID
- **返回**: 
```json
{
  "rechargeId": 5,
  "totalTimes": 10,
  "currentUsedTimes": 3,
  "currentRemainingTimes": 7,
  "actualUsedTimes": 3,
  "calculatedRemainingTimes": 7,
  "isCorrect": true,
  "message": "次数统计正确"
}
```

## 错误处理

系统会处理以下异常情况：
- 充值记录不存在
- 数据库连接异常
- 数据更新失败
- 数据验证失败

所有异常都会被捕获并返回相应的错误信息。

## 调试和监控

### 日志输出
系统会在控制台输出详细的调试信息：
- 充值记录次数统计的更新过程
- 数据保存的成功状态
- 错误信息和异常堆栈

### 验证工具
使用验证API可以随时检查数据的一致性：
```bash
curl -X GET "http://localhost:3000/consumption/verify-recharge-times/5"
```

### 测试脚本
提供了测试脚本 `test-recharge-times.js` 用于验证功能：
```bash
node backend/test-recharge-times.js
``` 