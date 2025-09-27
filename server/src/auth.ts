import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function issueToken(sub: number, email: string, role: string) {
  return jwt.sign({ sub, email, role }, JWT_SECRET, { expiresIn: '2h' });
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
