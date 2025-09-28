import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { CryptoUtil } from '../core/utils';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 20, unique: true, comment: '账号' })
  account: string;

  @Column({ length: 10, nullable: true, comment: '性别' })
  gender: string;

  @Column({ nullable: true, comment: '密码' })
  @Exclude()
  password: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  mobile: string;

  @Column({ length: 20, nullable: true, comment: '角色' })
  role: string;

  @Column({ length: 20, nullable: true, comment: '状态' })
  state: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'json', nullable: true, comment: '其他字段' })
  payload: string;

  /**
   * 虚拟字段：原始密码
   * 用于接收前端传来的明文密码，不会存储到数据库
   * 这是一个普通的TypeScript属性，不会被TypeORM映射到数据库
   */
  passwordRaw?: string;

  /**
   * 插入前加密密码
   */
  @BeforeInsert()
  hashPasswordBeforeInsert() {
    this.encryptPasswordIfNeeded();
  }

  /**
   * 更新前加密密码（仅当密码被修改时）
   */
  @BeforeUpdate()
  hashPasswordBeforeUpdate() {
    this.encryptPasswordIfNeeded();
  }

  /**
   * 加密密码（如果需要）
   * @private
   */
  encryptPasswordIfNeeded(): void {
    // 优先处理虚拟字段 passwordRaw
    console.log('====================xuehai==========', this.passwordRaw);
    if (this.passwordRaw) {
      this.password = CryptoUtil.hashPassword(this.passwordRaw);
      // 清空虚拟字段，避免泄露明文密码
      this.passwordRaw = undefined;
      return;
    }

    // 如果没有虚拟字段，但password字段存在且不是已加密的密码时才进行加密
    // MD5 哈希长度为32位十六进制字符
    if (this.password && this.password.length !== 32) {
      this.password = CryptoUtil.hashPassword(this.password);
    }
  }

  /**
   * 验证密码
   * @param password 明文密码
   * @returns 密码是否正确
   */
  validatePassword(password: string): boolean {
    return CryptoUtil.comparePassword(password, this.password);
  }

  /**
   * 设置新密码（通过虚拟字段）
   * @param newPassword 新的明文密码
   */
  setPassword(newPassword: string): void {
    this.passwordRaw = newPassword;
    this.encryptPasswordIfNeeded();
  }
}
