import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'app_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas permitidas sin autenticación
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

  // Verificar presencia de la cookie de sesión
  const cookie = req.cookies.get(COOKIE_NAME);

  if (!cookie?.value) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/entrar';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
