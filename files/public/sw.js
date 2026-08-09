/**
 * Service worker mínimo.
 *
 * Dos motivos para que exista:
 *  1. Chrome en Android pide un SW con manejador de fetch para ofrecer
 *     "Instalar aplicación" en condiciones.
 *  2. En la sala de tratamiento la cobertura es mala. La interfaz debe abrir
 *     igualmente aunque la red no responda.
 *
 * Los datos del día NUNCA salen de caché: un registro viejo confunde más
 * que un mensaje de error honesto.
 */

const CACHE = "nm-v1";
const PRECACHE = ["/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API: siempre red. Sin caché y sin inventar respuestas.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "Sin conexión. Inténtalo cuando vuelva el wifi." }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          })
      )
    );
    return;
  }

  // Resto: caché primero para que abra al instante, y refresco por detrás.
  event.respondWith(
    caches.match(request).then((cacheado) => {
      const red = fetch(request)
        .then((res) => {
          // No cachear redirecciones: la de /entrar dejaría la app atascada ahí.
          if (res.ok && !res.redirected && res.type === "basic") {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copia));
          }
          return res;
        })
        .catch(() => cacheado);
      return cacheado || red;
    })
  );
});
