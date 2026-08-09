import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/** Rutas que tienen que responder sin sesión, o no habría forma de entrar. */
const PUBLICAS = new Set([
  "/entrar",
  "/api/entrar",
  "/manifest.json",
  "/sw.js",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLICAS.has(pathname)) return NextResponse.next();

  const secret = process.env.APP_SECRET;
  if (!secret) {
    // Sin secreto no se puede verificar nada. Ante la duda se cierra, no se abre.
    console.error("APP_SECRET no está definida: se bloquea todo el tráfico.");
    return new NextResponse("Configuración incompleta del servidor.", { status: 503 });
  }

  if (await verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret)) {
    return NextResponse.next();
  }

  // La API responde 401; el navegador va a la pantalla de entrada.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sesión caducada. Vuelve a entrar." }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Todo menos los estáticos de Next, los iconos y las fotos del catálogo.
    "/((?!_next/static|_next/image|favicon.ico|icon-|apple-icon|meals/).*)",
  ],
};
