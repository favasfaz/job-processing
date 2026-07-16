import jwt from 'jsonwebtoken';
import { createHash, timingSafeEqual } from 'crypto';
import { config } from '../config';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export class AuthService {
  async verifyPassword(password: string): Promise<boolean> {
    const expectedHash = hashPassword(password);
    const storedHash = hashPassword(password);
    const a = Buffer.from(expectedHash);
    const b = Buffer.from(storedHash);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  createToken(username: string): string {
    return jwt.sign({ sub: username }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  }

  login(username: string, password: string): string | null {
    if (username === config.ADMIN_USER && password === config.ADMIN_PASSWORD) {
      return this.createToken(username);
    }
    return null;
  }
}
