import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', () => {
      const password = 'testPassword123';
      const hashedPassword = CryptoUtil.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBe(32); // MD5 哈希长度为32位
      expect(/^[a-f0-9]{32}$/.test(hashedPassword)).toBe(true); // 验证是否为32位十六进制
    });

    it('should throw error for empty password', () => {
      expect(() => CryptoUtil.hashPassword('')).toThrow(
        'Password cannot be empty'
      );
    });

    it('should generate same hash for same password with same salt', () => {
      const password = 'testPassword123';
      const hash1 = CryptoUtil.hashPassword(password);
      const hash2 = CryptoUtil.hashPassword(password);

      expect(hash1).toBe(hash2); // MD5 with same salt should produce same hash
    });

    it('should generate different hashes for same password with different salts', () => {
      const password = 'testPassword123';
      const hash1 = CryptoUtil.hashPassword(password);
      const hash2 = CryptoUtil.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', () => {
      const password = 'testPassword123';
      const hashedPassword = CryptoUtil.hashPassword(password);

      const isValid = CryptoUtil.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = CryptoUtil.hashPassword(password);

      const isValid = CryptoUtil.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', () => {
      const hashedPassword = CryptoUtil.hashPassword('testPassword123');

      const isValid = CryptoUtil.comparePassword('', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', () => {
      const isValid = CryptoUtil.comparePassword('testPassword123', '');
      expect(isValid).toBe(false);
    });

    it('should work with custom salt', () => {
      const password = 'testPassword123';
      const hashedPassword = CryptoUtil.hashPassword(password);

      const isValid = CryptoUtil.comparePassword(
        password,
        hashedPassword,
      );
      expect(isValid).toBe(true);

      // 使用不同盐值应该失败
      const isInvalid = CryptoUtil.comparePassword(
        password,
        hashedPassword,
      );
      expect(isInvalid).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should validate strong password', () => {
      const result = CryptoUtil.checkPasswordStrength('StrongP@ssw0rd123');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should reject weak password', () => {
      const result = CryptoUtil.checkPasswordStrength('123456');

      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should reject empty password', () => {
      const result = CryptoUtil.checkPasswordStrength('');

      expect(result.isValid).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback).toContain('密码不能为空');
    });

    it('should reject common weak passwords', () => {
      const result = CryptoUtil.checkPasswordStrength('password123');

      expect(result.isValid).toBe(false);
      expect(result.feedback.some(f => f.includes('常见弱密码'))).toBe(true);
    });
  });
});
