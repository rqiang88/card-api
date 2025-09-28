import { DataSource } from 'typeorm'
import { User } from '@/entities/user.entity'
import { CryptoUtil } from '@/core/utils'

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User)

  // 检查是否已存在管理员用户
  const existingAdmin = await userRepository.findOne({
    where: { name: 'admin' }
  })

  if (!existingAdmin) {
    const hashedPassword = CryptoUtil.hashPassword('123456')

    const adminUser = userRepository.create({
      name: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'admin',
      state: 'actived',
    })

    await userRepository.save(adminUser)
    console.log('Admin user created: admin / 123456')
  }

  // 创建操作员用户
  const existingOperator = await userRepository.findOne({
    where: { name: 'operator' }
  })

  if (!existingOperator) {
    const hashedPassword = CryptoUtil.hashPassword('123456')

    const operatorUser = userRepository.create({
      name: 'operator',
      password: hashedPassword,
      email: 'operator@example.com',
      role: 'operator',
      state: 'actived',
    })

    await userRepository.save(operatorUser)
    console.log('Operator user created: operator / 123456')
  }
}
