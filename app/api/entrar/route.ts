import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, COOKIE_NAME } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const validPin = process.env.APP_PIN || '1234';

    if (pin !== validPin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 31536000,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
