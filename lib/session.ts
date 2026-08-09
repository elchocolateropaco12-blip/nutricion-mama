import { NextRequest } from 'next/server';

export const COOKIE_NAME = 'app_session';
export const SESSION_COOKIE = 'app_session';

export async function createSessionToken(): Promise<string> {
  const secret = process.env.APP_SECRET || 'clave-secreta-rodrigo-2026';
  const payload = 'authenticated_user';
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hashHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${payload}.${hashHex}`;
}

export async function verifySession(
  reqOrToken?: NextRequest | string | null,
  _legacySecret?: string
): Promise<boolean> {
  let token: string | undefined;

  if (typeof reqOrToken === 'string') {
    token = reqOrToken;
  } else if (reqOrToken && 'cookies' in reqOrToken) {
    token = reqOrToken.cookies.get(COOKIE_NAME)?.value || reqOrToken.cookies.get(SESSION_COOKIE)?.value;
  }

  if (!token) return false;

  const expectedToken = await createSessionToken();
  return token === expectedToken;
}
