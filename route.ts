import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_DAYS, signSession, timingSafeEqual } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pinEsperado = process.env.APP_PIN;
  const secret = process.env.APP_SECRET;

  if (!pinEsperado || !secret) {
    console.error("Faltan APP_PIN o APP_SECRET.");
    return NextResponse.json({ error: "Configuración incompleta." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = typeof body?.pin === "string" ? body.pin : "";

  // Retraso fijo. No sustituye a un PIN largo, pero convierte la fuerza bruta
  // sobre 8 dígitos en algo del orden de años en vez de minutos.
  await new Promise((r) => setTimeout(r, 700));

  if (!timingSafeEqual(pin, pinEsperado)) {
    return NextResponse.json({ error: "El código no es correcto." }, { status: 401 });
  }

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await signSession(expiresAt, secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
