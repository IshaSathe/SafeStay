import 'dotenv/config';

const BASE = process.env.AMADEUS_BASE_URL ?? 'https://test.api.amadeus.com';
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID!;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET!;

let cached: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt - 30 > now) return cached.token;

  const resp = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  if (!resp.ok) throw new Error(`Token error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json() as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Math.floor(Date.now()/1000) + data.expires_in };
  return cached.token;
}

export async function amadeusGET(pathWithQuery: string) {
  const token = await getToken();
  const resp = await fetch(`${BASE}${pathWithQuery}`, { headers: { Authorization: `Bearer ${token}` }});
  if (!resp.ok) throw new Error(`GET ${pathWithQuery} ${resp.status}: ${await resp.text()}`);
  return resp.json();
}
