import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'app_session';
export const SESSION_COOKIE = 'app_session';

async function getSecretKey(customSecret?: string) {
  const secret = customSecret || process.env.APP_SECRET || 'clave-secreta-rodrigo-2026';
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(customSecret?: string): Promise<string> {
  const payload = 'authenticated_user';
  const key = await getSecretKey(customSecret);
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${payload}.${hashHex}`;
}

export async function verifySession(
  tokenOrReq?: string | NextRequest | null,
  customSecret?: string
): Promise<boolean> {
  let token: string | undefined;

  if (typeof tokenOrReq === 'string') {
    token = tokenOrReq;
  } else if (tokenOrReq && 'cookies' in tokenOrReq) {
    token = tokenOrReq.cookies.get(COOKIE_NAME)?.value || tokenOrReq.cookies.get('app_session')?.value;
  }

  if (!token) return false;

  const [payload, signatureHex] = token.split('.');
  if (!payload || !signatureHex) return false;

  const expectedToken = await createSessionToken(customSecret);
  return token === expectedToken;
}
