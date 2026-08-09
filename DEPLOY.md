# Puesta en producción

Guía de principio a fin. Tiempo estimado: 45–60 minutos, casi todo esperando builds y sacando fotos a los platos.

---

## Bloque 0 · Lo que cambié antes de escribir esto

Tal como estaba el MVP, **no se podía desplegar**. Las rutas de API usaban `service_role` con `DEFAULT_USER_ID` y sin ninguna autenticación: en `localhost` da igual, pero en una URL pública de Vercel significa que cualquiera que dé con la dirección lee y escribe el historial de nutrición oncológica de tu madre. Las URLs de Vercel son adivinables y los bots las rastrean.

Añadí un candado de fricción mínima:

| Archivo | Qué hace |
|---|---|
| `middleware.ts` | Nada responde sin cookie de sesión válida. La API devuelve 401, el navegador va a `/entrar` |
| `lib/session.ts` | Cookie firmada con HMAC-SHA256 vía Web Crypto (el middleware corre en Edge, no hay `node:crypto`) |
| `app/entrar/page.tsx` | Pantalla de código. Se escribe **una sola vez**: la cookie dura un año |
| `app/api/entrar/route.ts` | Verifica el PIN en tiempo constante, con 700 ms de retraso fijo contra fuerza bruta |

También añadí `public/sw.js` (sin service worker, Chrome no ofrece "Instalar aplicación" en condiciones) y cambié el modelo por defecto: **`gemini-2.5-flash` se apaga el 16 de octubre de 2026**. Ahora es `gemini-3.6-flash`.

---

## Bloque 1 · Supabase

### 1.1 Crear el proyecto

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `nutricion-mama` · Region: **West EU (Ireland)** — es el más cercano a Madrid y baja la latencia de cada guardado
3. Database Password: genérala y **guárdala en tu gestor de contraseñas ahora**. Supabase no vuelve a enseñarla
4. Plan Free. El uso real de esta app es de unos pocos MB al año

> El plan Free **pausa el proyecto tras 7 días sin actividad**. Ella lo abre a diario, así que no debería pasar, pero si se va de viaje una semana la app dará error al volver hasta que entres al panel y le des a *Restore*.

### 1.2 Ejecutar el esquema

**SQL Editor** → **New query** → pega el contenido íntegro de `supabase/schema.sql` → **Run**.

Debe terminar con `Success. No rows returned`. Comprueba que se crearon las tres tablas:

```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
-- daily_summaries · daily_totals · meal_entries · profiles
```

Y que el bucket de fotos quedó **privado**:

```sql
select id, public, file_size_limit from storage.buckets where id = 'meal-photos';
-- public debe ser false. Si sale true, vuelve a ejecutar esa parte del schema.
```

### 1.3 Crear la usuaria

**Authentication** → **Users** → **Add user** → **Create new user**

- Email: uno real tuyo o suyo (no se usa para entrar, pero Supabase lo exige)
- Password: cualquiera, tampoco se usa
- **Auto Confirm User: sí**

Copia el UUID que aparece en la lista. Es el `DEFAULT_USER_ID`.

### 1.4 Limpiar datos de prueba

Ejecuta `supabase/reset.sql`. Está en pasos numerados: el 1 te enseña qué hay, el 2A borra todo, el 4 confirma que quedó a cero y el 5 te da otra vez el UUID.

```sql
begin;
  delete from public.daily_summaries;
  delete from public.meal_entries;
commit;
```

El orden importa: los resúmenes referencian comidas. Y ojo, **las fotos de prueba viven en Storage, no en estas tablas** — el SQL no las toca. Vacía las carpetas desde **Storage → meal-photos** o con `delete from storage.objects where bucket_id = 'meal-photos';`.

### 1.5 Las claves

**Project Settings** → **API Keys**:

| Panel | Variable | Cuidado |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Pública, sin problema |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública. Va protegida por RLS |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` | **Salta TODAS las políticas RLS** |

La `service_role` no lleva prefijo `NEXT_PUBLIC_` y no puede llevarlo nunca: cualquier variable con ese prefijo acaba dentro del JavaScript que descarga el navegador. Si alguna vez la pegas en un sitio equivocado, rótala desde este mismo panel.

---

## Bloque 2 · Las fotos de los platos

### 2.1 Nombres exactos

En `public/meals/`, con estos nombres literales (los lee `lib/preset-meals.ts`):

```
public/meals/
├── desayuno-a.jpg    Gachas de avena con manzana, nueces y tostada
├── desayuno-b.jpg    Tostadas con huevo, plátano y vaso de leche
├── desayuno-c.jpg    Batido densificado con tostada
├── comida-a.jpg      Pescado blanco con patata, judías y pan
├── comida-b.jpg      Ensalada de pasta templada con pollo
├── merienda-a.jpg    Yogur griego con plátano y almendra
├── merienda-b.jpg    Manzana asada con queso batido y canela
├── cena-a.jpg        Sopa de verduras con huevo escalfado y pan
├── cena-b.jpg        Crema de calabacín con pollo desmechado
├── cena-c.jpg        Pollo al limón con cuscús y zanahoria
├── cena-d.jpg        Salmón al horno con patata y espárragos
└── cena-e.jpg        Tortilla de calabacín con patata cocida
```

Un nombre mal escrito no rompe nada: sale un rectángulo verde vacío en ese plato y nada más. Por eso es fácil que pase desapercibido, revísalos.

### 2.2 Formato

- **JPEG**, cuadrada, **800 × 800 px**, calidad 82, por debajo de 120 KB
- No hace falta más: la tarjeta las muestra a 88 px y `next/image` las reescala sola. 800 da margen para pantallas retina
- **Sin metadatos EXIF.** Las fotos hechas con el móvil en casa llevan coordenadas GPS. El script las borra

### 2.3 El script

```bash
brew install imagemagick          # macOS
sudo apt install imagemagick      # Linux

./scripts/optimizar-imagenes.sh ~/Fotos/platos
```

Busca en esa carpeta un archivo por plato cuyo nombre empiece por el id (`desayuno-a.HEIC`, `comida-b_final.jpg`...), recorta al centro en cuadrado, respeta la rotación del móvil, borra el EXIF y escribe el `.jpg` en `public/meals/`. Si falta alguna te lo dice y sale con error.

### 2.4 Hazlas tú, con sus platos

Vale la pena la media hora. Reconocer **su propio plato** en la foto es lo que convierte la elección en un vistazo. Una foto de banco de imágenes que no se parece a lo que ella cocina la obliga a leer el texto, y leer ya es fricción.

Cenital, luz de ventana, sin flash, plato blanco sobre mantel liso. Las doce en la misma sesión para que compartan luz: es lo que hace que la lista se lea como un conjunto y no como doce recortes.

---

## Bloque 3 · Vercel

### 3.1 Antes de subir nada

```bash
# El PIN. 8 dígitos: con 4 se revientan en minutos aunque haya retraso.
python3 -c "import secrets; print(''.join(secrets.choice('0123456789') for _ in range(8)))"

# El secreto de firma de la cookie
openssl rand -base64 48
```

Guarda los dos. El PIN se lo dirás a ella una vez; el secreto no lo necesita nadie más.

### 3.2 Comprobar que compila en local

Es el paso que más disgustos ahorra: un fallo de TypeScript aquí es un build roto allí, y depurarlo en los logs de Vercel es mucho más lento.

```bash
npm install
cp .env.example .env.local     # y rellena las 8 variables
npm run typecheck
npm run build
```

### 3.3 Desplegar

**Opción A — repositorio (recomendada).** Cada `git push` despliega solo, y eso importa cuando dentro de dos meses haya que cambiar el modelo de Gemini.

```bash
git init && git add . && git commit -m "PWA de nutrición"
gh repo create nutricion-mama --private --source=. --push
```

**Repositorio privado, no público.** Aunque `.gitignore` cubre `.env.local`, el catálogo de platos describe su tratamiento.

En [vercel.com/new](https://vercel.com/new) → importa el repo → **antes de darle a Deploy**, despliega *Environment Variables* y mete las 8 (bloque 3.4). Si despliegas sin ellas el build falla y hay que repetirlo.

**Opción B — CLI.**

```bash
npm i -g vercel
vercel login
vercel link
for v in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY \
         SUPABASE_SERVICE_ROLE_KEY DEFAULT_USER_ID \
         APP_PIN APP_SECRET GEMINI_API_KEY GEMINI_MODEL; do
  vercel env add "$v" production
done
vercel --prod
```

### 3.4 Las 8 variables

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave `anon` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | clave `service_role` | Production |
| `DEFAULT_USER_ID` | UUID de auth.users | Production |
| `APP_PIN` | los 8 dígitos | Production |
| `APP_SECRET` | el `openssl rand` | Production |
| `GEMINI_API_KEY` | de [AI Studio](https://aistudio.google.com/apikey) | Production |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Production |

Márcalas también en Preview si vas a usar ramas. **Cambiar una variable no redespliega solo**: hay que ir a *Deployments* → `…` → *Redeploy*. Es la causa número uno de "he cambiado la clave y sigue fallando".

### 3.5 Build y verificación

Comando de build: `next build`. Vercel lo detecta solo, no toques nada.

```bash
curl -I https://TU-APP.vercel.app/manifest.json     # 200
curl -s -o /dev/null -w "%{http_code}\n" \
     https://TU-APP.vercel.app/api/entries          # 401 ← el candado funciona
```

Si `/api/entries` responde **200** en vez de 401, el middleware no está activo. Para. Revisa que `middleware.ts` está en la raíz (no dentro de `app/`) y que `APP_SECRET` existe en Vercel.

**Sobre el timeout.** Las rutas declaran `maxDuration = 30`. En el plan Hobby las fuentes no coinciden (10 s en unas, 60 s en otras según Fluid Compute), así que puede fallar el build con *invalid maxDuration*. Si pasa: bájalo a `10` en las tres rutas y activa **Fluid Compute** en *Settings → Functions*. Con `gemini-3.6-flash` el análisis de una foto tarda 3–6 s, así que sobra margen.

El plan Hobby prohíbe uso comercial. Una app familiar entra sin problema.

---

## Bloque 4 · Instalarla en su teléfono

Hazlo tú, con su móvil en la mano. Son dos minutos y evita que ella se pelee con un menú.

### Android · Chrome

1. Abre `https://TU-APP.vercel.app`
2. Escribe el PIN → **Entrar**
3. Menú **⋮** → **Instalar aplicación** (o **Añadir a pantalla de inicio**)
4. Confirma **Instalar**

Si no aparece "Instalar aplicación": los iconos dan 404, el service worker no se registró, o no estás en HTTPS. Compruébalo en **⋮ → Más herramientas → Herramientas para desarrolladores → Application → Manifest**.

### iOS · Safari

**Tiene que ser Safari.** Chrome en iPhone no puede instalar PWAs, es una restricción de Apple.

1. Abre la URL en **Safari**
2. Escribe el PIN → **Entrar**
3. Botón **Compartir** (cuadrado con flecha, abajo en el centro)
4. Baja hasta **Añadir a pantalla de inicio** → **Añadir**

### Por qué se abre a pantalla completa

Ya está configurado, pero para que sepas dónde mirar si algo falla:

| Qué | Dónde | Para qué |
|---|---|---|
| `"display": "standalone"` | `public/manifest.json` | Oculta la barra de direcciones en Android |
| `appleWebApp.capable: true` | `app/layout.tsx` | El equivalente en iOS |
| `themeColor: "#2E6A57"` | `app/layout.tsx` | Tiñe la barra de estado de verde |
| `app/apple-icon.png` | lo genera `generar-iconos.sh` | iOS ignora el manifest para el icono |
| **sin `maximumScale`** | `app/layout.tsx` | Bloquear el zoom en una app de accesibilidad sería absurdo |

### Comprobaciones con ella delante

- [ ] El icono está en su pantalla de inicio, no es una captura borrosa
- [ ] Al abrirlo **no se ve la barra de direcciones**
- [ ] La barra de estado sale verde
- [ ] **No vuelve a pedir el código.** Es lo más importante: si lo pide cada vez, el candado está mal y ella abandonará la app
- [ ] Los botones se tocan sin apuntar
- [ ] En modo avión, abre igual (aunque no pueda guardar)

---

## Bloque 5 · QA post-despliegue

### Automático

```bash
./scripts/qa.sh https://TU-APP.vercel.app 84213977
```

Recorre el flujo entero: recursos de la PWA, que la API rechaza sin sesión, que un PIN incorrecto se rechaza y el correcto abre sesión, registra las 4 comidas, comprueba que se leen de Supabase, que `fat_warning` lo calcula Postgres, genera el resumen midiendo cuánto tarda, verifica que la segunda llamada usa caché, prueba el deshacer y **borra el día de prueba al terminar**.

Si algo falla, sale con código 1 y te dice qué.

### Manual, con el móvil

**Guardado.** Toca *Elegir comida* → *Pasta con pollo*. Debe volver a la pantalla principal con el plato puesto y el nodo del hilo en miel. En Supabase, **Table Editor → meal_entries**, debe haber una fila con `source = 'preset'`, `preset_id = 'comida-b'` y `log_date` de hoy en hora de Madrid (ojo si pruebas de noche: una cena a las 23:30 tiene que contar como hoy, no como mañana).

**Deshacer.** *Quitar* → desaparece de la pantalla y la fila se borra de la tabla.

**Rodrigo.** Registra las cuatro. La tarjeta de abajo se activa. Toca *Ver el resumen*: tarda unos segundos y devuelve nota, macros y texto.

Léelo entero antes de dárselo. **Comprueba que suena a ti y no a una app:** sin emojis, sin "¡genial!", empezando por lo que ha salido bien. Y prueba a propósito un día flojo (`cena-e` + `merienda-b`, los platos más ligeros) para ver que **no la riñe**: el prompt tiene un suelo de 6 si registra las cuatro comidas. Si el tono no te convence, la línea está en `lib/ai.ts`, `RODRIGO_SYSTEM`.

**Aviso de grasa.** Ningún plato del catálogo pasa de 13,8 g, así que el aviso ámbar no salta con presets. Para probarlo, foto de algo frito: debe aparecer el recuadro ámbar con los gramos.

**Foto.** *Hacer foto de otra comida* → debe abrir la cámara trasera directamente. En Supabase, **Storage → meal-photos**, la foto en `{user_id}/{fecha}/`. Intenta abrir su URL pública en una pestaña de incógnito: **tiene que dar error**. Si se ve, el bucket quedó público y hay que arreglarlo.

### Antes de irte

- [ ] `./scripts/qa.sh` en verde
- [ ] `meal_entries` y `daily_summaries` vacías
- [ ] Storage vacío
- [ ] Repositorio **privado**
- [ ] `.env.local` fuera de git (`git ls-files | grep env` no devuelve nada)
- [ ] PIN de 8 dígitos guardado en tu gestor de contraseñas
- [ ] **Recordatorio en el calendario para el 1 de octubre de 2026**: `gemini-3.6-flash` acabará caducando como caducó el 2.5. Es cambiar `GEMINI_MODEL` en Vercel y redesplegar, pero si nadie lo mira, la app se rompe sin avisar. Fechas en [ai.google.dev/gemini-api/docs/deprecations](https://ai.google.dev/gemini-api/docs/deprecations)

---

## Cuando algo falle

| Síntoma | Causa casi segura |
|---|---|
| `/api/entries` responde 200 sin sesión | `middleware.ts` no está en la raíz, o falta `APP_SECRET` |
| Pide el PIN en cada apertura | La cookie no se guarda: la app tiene que abrirse por **https**, nunca por IP local |
| `Configuración incompleta` al entrar | Falta `APP_PIN` o `APP_SECRET`, o cambiaste una variable sin redesplegar |
| El resumen da 500 | Modelo caducado o `GEMINI_API_KEY` mal. Mira los logs en *Vercel → Deployments → Functions* |
| El resumen da 409 | Faltan comidas por registrar. Es el comportamiento correcto |
| Foto: `El análisis ha tardado demasiado` | Timeout. Prueba `GEMINI_MODEL=gemini-3.5-flash-lite` |
| Rectángulo verde en vez de foto | Nombre de archivo mal escrito en `public/meals/` |
| Android no ofrece "Instalar" | Faltan los iconos, o el SW no se registró |
| Todo devuelve 500 de golpe | Proyecto de Supabase pausado por inactividad. Panel → *Restore* |
