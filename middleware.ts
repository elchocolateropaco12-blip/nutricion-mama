import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'app_session';

async function verifyCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;

  try {
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

    const expectedToken = `${payload}.${hashHex}`;
    return cookieValue === expectedToken;
  } catch (err) {
    console.error('Error verificando cookie:', err);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    if (
      pathname.startsWith('/entrar') ||
      pathname.startsWith('/api/entrar') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/meals') ||
      pathname.startsWith('/icons') ||
      pathname === '/favicon.ico' ||
      pathname === '/manifest.json' ||
      pathname === '/sw.js'
    ) {
      return NextResponse.next();
    }

    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    const isValid = await verifyCookie(cookie);

    if (!isValid) {
      const loginUrl = new URL('/entrar', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware:', error);
    const loginUrl = new URL('/entrar', req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
