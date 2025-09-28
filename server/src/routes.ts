import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { comparePassword, hashPassword, issueToken } from './auth';
import jwt from 'jsonwebtoken';
import { amadeusGET } from './amadeus';

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

// --- Hotel search (by city -> offers)
router.get('/ext/hotels/search', authGuard, requireRole(Role.SEEKER), async (req, res) => {
  try {
    const q = req.query as Record<string,string>;
    const cityCode = q.cityCode;
    const checkInDate = q.checkInDate;
    const checkOutDate = q.checkOutDate;
    const adults = q.adults ?? '1';
    const limit = Math.max(1, Math.min(50, parseInt(q.limit ?? '15', 10)));
    const currency = q.currency ?? 'USD';

    if (!cityCode || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'cityCode, checkInDate, checkOutDate are required' });
    }

    const byCity = await amadeusGET(`/v1/reference-data/locations/hotels/by-city?cityCode=${encodeURIComponent(cityCode)}`);
    const hotels = Array.isArray(byCity?.data) ? byCity.data.slice(0, limit) : [];
    if (hotels.length === 0) return res.json({ hotels: [], offers: [] });

    const hotelIds = hotels.map((h: any) => h.hotelId).join(',');
    const offersResp = await amadeusGET(
      `/v3/shopping/hotel-offers?hotelIds=${encodeURIComponent(hotelIds)}&adults=${encodeURIComponent(adults)}&checkInDate=${encodeURIComponent(checkInDate)}&checkOutDate=${encodeURIComponent(checkOutDate)}&currency=${encodeURIComponent(currency)}`
    );

    const offers = Array.isArray(offersResp?.data) ? offersResp.data.map((o: any) => ({
      hotel: {
        hotelId: o.hotel?.hotelId,
        name: o.hotel?.name,
        cityCode: o.hotel?.cityCode,
        address: o.hotel?.address?.lines?.join(', ')
      },
      available: o.available,
      offers: (o.offers ?? []).map((of: any) => ({
        id: of.id,
        checkInDate: of.checkInDate,
        checkOutDate: of.checkOutDate,
        room: of.room?.type,
        description: of.room?.description?.text,
        guests: of.guests?.adults,
        price: { total: of.price?.total, currency: of.price?.currency }
      }))
    })) : [];

    res.json({ offers }); // compact: list of hotels each with offers[]
  } catch (e: any) {
    res.status(502).json({ message: 'Amadeus search failed', detail: e?.message ?? e });
  }
});

// --- Create request (optionally with selected hotel/offer) ---
function parseCreateRequestBody(body: any) {
  const errors: string[] = [];
  const out: any = {};

  // Required
  if (!body?.startDate) errors.push('startDate required');
  if (!body?.endDate)   errors.push('endDate required');
  if (body?.guests == null) errors.push('guests required');
  if (!body?.city) errors.push('city required');

  if (errors.length) return { ok: false, errors };

  const sd = new Date(body.startDate), ed = new Date(body.endDate);
  if (isNaN(sd.getTime()) || isNaN(ed.getTime())) errors.push('startDate/endDate invalid');
  else if (ed <= sd) errors.push('endDate must be after startDate');

  out.startDate = sd; out.endDate = ed;
  out.guests = Number(body.guests); if (!Number.isFinite(out.guests) || out.guests < 1) errors.push('guests must be >=1');

  if (body.rooms != null) { out.rooms = Number(body.rooms); if (!Number.isFinite(out.rooms) || out.rooms < 1) errors.push('rooms must be >=1'); }
  out.city = String(body.city);
  if (body.state != null) out.state = String(body.state);
  if (body.cityCode != null) out.cityCode = String(body.cityCode);
  if (body.maxNightlyUSD != null) { out.maxNightlyUSD = Number(body.maxNightlyUSD); if (!Number.isFinite(out.maxNightlyUSD) || out.maxNightlyUSD < 0) errors.push('maxNightlyUSD must be >=0'); }
  if (body.notes != null) out.notes = String(body.notes);

  if (body.amadeusHotelId != null) out.amadeusHotelId = String(body.amadeusHotelId);
  if (body.amadeusOfferId != null) out.amadeusOfferId = String(body.amadeusOfferId);

  return { ok: errors.length === 0, value: out, errors };
}

/** POST /api/requests  (SEEKER) */
router.post('/requests', authGuard, requireRole(Role.SEEKER), async (req, res) => {
  const { ok, value, errors } = parseCreateRequestBody(req.body);
  if (!ok) return res.status(400).json({ message: 'Invalid body', errors });

  const goalCents =
    Number.isFinite(Number(req.body.goalCents)) && Number(req.body.goalCents) > 0
      ? Math.round(Number(req.body.goalCents))
      : null;
  
  const user = (req as any).user as { sub: number };
  const created = await prisma.hotelRequest.create({
    data: {
      ...value,
      seekerId: user.sub,
      amadeusHotelId: req.body.amadeusHotelId ?? null,
      amadeusOfferId: req.body.amadeusOfferId ?? null,
      goalCents: goalCents,
      status: 'OPEN'
    }
  });
  res.status(201).json({ request: created });
});

// ---- Sponsor-facing: list requests with progress ----
router.get('/requests/open', authGuard, requireRole(Role.SPONSOR), async (_req, res) => {
  // Fetch OPEN and PENDING requests
  const requests = await prisma.hotelRequest.findMany({
    where: { status: { in: ['OPEN', 'PENDING'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, startDate: true, endDate: true, guests: true, rooms: true,
      city: true, state: true, cityCode: true, maxNightlyUSD: true,
      notes: true, amadeusHotelId: true, amadeusOfferId: true, goalCents: true,
      seeker: { select: { id: true, email: true } }
    }
  });

  // Aggregate raised per request (one-by-one for simplicity)
  const withTotals = await Promise.all(
    requests.map(async r => {
      const sum = await prisma.contribution.aggregate({
        where: { requestId: r.id },
        _sum: { amountCents: true }
      });
      return {
        ...r,
        raisedCents: sum._sum.amountCents ?? 0
      };
    })
  );

  res.json({ requests: withTotals });
});

// ---- Sponsor contribute to a request ----
router.post('/requests/:id/contributions', authGuard, requireRole(Role.SPONSOR), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid request id' });

  const amount = Number(req.body?.amountCents);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'amountCents must be > 0' });

  // Ensure the request exists and is fundable
  const request = await prisma.hotelRequest.findUnique({ where: { id } });
  if (!request) return res.sendStatus(404);
  if (!['OPEN', 'PENDING'].includes(request.status)) {
    return res.status(409).json({ message: 'Request is not accepting contributions' });
  }

  const sponsor = (req as any).user as { sub: number; role: Role };

  // Create the contribution
  await prisma.contribution.create({
    data: { requestId: id, sponsorId: sponsor.sub, amountCents: amount }
  });

  // Recompute raised and optionally flip status to MATCHED/FULFILLED if goal reached
  const agg = await prisma.contribution.aggregate({
    where: { requestId: id },
    _sum: { amountCents: true }
  });
  const raised = agg._sum.amountCents ?? 0;

  let updated = request;
  if (request.goalCents && raised >= request.goalCents && request.status !== 'FULFILLED') {
    updated = await prisma.hotelRequest.update({
      where: { id },
      data: { status: 'FULFILLED' }
    });
  }

  res.status(201).json({
    request: {
      id: updated.id,
      goalCents: updated.goalCents,
      status: updated.status,
      raisedCents: raised
    }
  });
});

export default router;