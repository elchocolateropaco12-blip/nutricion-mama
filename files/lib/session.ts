/**
 * Sesión firmada con HMAC-SHA256.
 *
 * Usa Web Crypto en vez de `node:crypto` porque el middleware corre en el
 * runtime Edge, donde `node:crypto` no existe.
 *
 * La cookie no guarda datos: es `caducidad.firma`. Si alguien la manipula,
 * la firma deja de cuadrar. No hay sesiones en base de datos que mantener.
 */

const enc = new TextEncoder();

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Comparación en tiempo constante: no filtra por dónde falla. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(expiresAt: number, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(String(expiresAt)));
  return `${expiresAt}.${b64url(sig)}`;
}

export async function verifySession(
  value: string | undefined,
  secret: string
): Promise<boolean> {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot < 1) return false;

  const expiresAt = Number(value.slice(0, dot));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return timingSafeEqual(await signSession(expiresAt, secret), value);
}

export const SESSION_COOKIE = "nm_sesion";
export const SESSION_DAYS = 365;
