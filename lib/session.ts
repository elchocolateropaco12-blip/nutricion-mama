import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'app_session';

async function getSecretKey() {
  const secret = process.env.APP_SECRET || 'clave-secreta-rodrigo-2026';
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(): Promise<string> {
  const payload = 'authenticated_user';
  const key = await getSecretKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${payload}.${hashHex}`;
}

export async function verifySession(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const [payload, signatureHex] = cookie.value.split('.');
  if (!payload || !signatureHex) return false;

  const expectedToken = await createSessionToken();
  return cookie.value === expectedToken;
}

export const SESSION_COOKIE = "nm_sesion";
export const SESSION_DAYS = 365;
