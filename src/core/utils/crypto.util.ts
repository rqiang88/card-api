import * as crypto from 'crypto'

/**
 * 密码加密工具类 - 使用 MD5 加密
 */
export class CryptoUtil {
  /**
   * 默认盐值，用于增强 MD5 安全性
   */

  /**
   * 对密码进行 MD5 哈希加密
   * @param password 明文密码
   * @param salt 可选的盐值，默认使用系统盐值
   * @returns 加密后的密码哈希
   */
  static hashPassword(password: string): string {
    if (!password) {
      throw new Error('Password cannot be empty')
    }

    try {
      return crypto.createHash('md5').update(password).digest('hex')
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`)
    }
  }

  /**
   * 验证密码是否正确
   * @param password 明文密码
   * @param hashedPassword 加密后的密码哈希
   * @param salt 可选的盐值，默认使用系统盐值
   * @returns 密码是否匹配
   */
  static comparePassword(password: string, hashedPassword: string): boolean {
    if (!password || !hashedPassword) {
      return false
    }

    try {
      const computedHash = this.hashPassword(password)
      return computedHash === hashedPassword
    } catch (error) {
      console.error('Password comparison failed:', error)
      return false
    }
  }

  /**
   * 检查密码强度
   * @param password 密码
   * @returns 密码强度信息
   */
  static checkPasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (!password) {
      return {
        isValid: false,
        score: 0,
        feedback: ['密码不能为空']
      }
    }

    // 长度检查
    if (password.length < 8) {
      feedback.push('密码长度至少8位')
    } else if (password.length >= 12) {
      score += 2
    } else {
      score += 1
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码应包含小写字母')
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码应包含大写字母')
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('密码应包含数字')
    }

    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1
    } else {
      feedback.push('密码应包含特殊字符')
    }

    // 不包含常见弱密码
    const weakPasswords = ['123456', 'password', 'admin', 'qwerty', '111111', '123123']
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      feedback.push('密码不能包含常见弱密码')
      score = Math.max(0, score - 2)
    }

    const isValid = score >= 4 && password.length >= 8 && feedback.length === 0

    return {
      isValid,
      score,
      feedback: feedback.length > 0 ? feedback : ['密码强度良好']
    }
  }
}
