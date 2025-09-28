import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { comparePassword, hashPassword, issueToken } from './auth';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

/** POST /api/auth/register */
router.post('/auth/register', async (req: Request, res: Response) => {
  const { email, password, role } = req.body ?? {};
  if (!email || !password || !role) return res.status(400).json({ message: 'email, password, role are required' });
  if (!Object.values(Role).includes(role)) return res.status(400).json({ message: 'invalid role' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash, role } });
  const accessToken = issueToken(user.id, user.email, user.role);
  return res.status(201).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
});

/** POST /api/auth/login */
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = issueToken(user.id, user.email, user.role);
  return res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
});

/** Bearer auth middleware */
function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.sendStatus(401);
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret') as any;
    (req as any).user = payload;
    next();
  } catch {
    return res.sendStatus(401);
  }
}

/** Role guard helper */
function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user;
    if (u && roles.includes(u.role)) return next();
    return res.sendStatus(403);
  };
}

/** GET /api/auth/me */
router.get('/auth/me', authGuard, (req, res) => {
  res.json({ user: (req as any).user });
});

/** Example sponsor-only endpoint */
router.get('/sponsor/summary', authGuard, requireRole(Role.SPONSOR), (_req, res) => {
  res.json({ message: 'Sponsor-only data' });
});

export default router;
