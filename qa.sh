#!/usr/bin/env bash
# QA post-despliegue. Recorre el flujo completo contra la URL de producción.
#
#   ./scripts/qa.sh https://comida-mama.vercel.app 84213977
#
# Registra un día entero de prueba y pide el resumen. AL TERMINAR BORRA lo
# que ha creado, pero comprueba en Supabase que no queda nada antes de
# dejárselo a tu madre.
set -uo pipefail

URL="${1:?Uso: ./scripts/qa.sh <url> <pin>}"
PIN="${2:?Falta el PIN}"
URL="${URL%/}"
COOKIES=$(mktemp)
trap 'rm -f "$COOKIES"' EXIT

ok=0; fallos=0
paso()  { printf "  \033[32m✓\033[0m %s\n" "$1"; ok=$((ok+1)); }
falla() { printf "  \033[31m✗\033[0m %s\n     %s\n" "$1" "${2:-}"; fallos=$((fallos+1)); }

codigo() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo
echo "QA contra $URL"
echo "──────────────────────────────────────────────────"

# ─── 1. Recursos estáticos de la PWA
echo
echo "1. Recursos de la PWA"
for ruta in /manifest.json /sw.js /icon-192.png /icon-512.png /icon-maskable-512.png; do
  c=$(codigo "$URL$ruta")
  [ "$c" = "200" ] && paso "$ruta" || falla "$ruta" "devuelve $c (sin esto no sale 'Instalar')"
done

manifest=$(curl -s "$URL/manifest.json")
echo "$manifest" | grep -q '"display": *"standalone"' \
  && paso "display: standalone (se oculta la barra del navegador)" \
  || falla "display no es standalone" "abriría dentro del navegador"

# ─── 2. El candado
echo
echo "2. Acceso"
c=$(codigo "$URL/api/entries")
[ "$c" = "401" ] && paso "la API rechaza sin sesión (401)" \
  || falla "la API responde $c sin sesión" "DATOS MÉDICOS EXPUESTOS: no sigas"

c=$(codigo -L -o /dev/null -w "%{url_effective}" "$URL/")
redir=$(curl -s -o /dev/null -L -w "%{url_effective}" "$URL/")
case "$redir" in
  */entrar) paso "la raíz redirige a /entrar" ;;
  *)        falla "la raíz no redirige" "acaba en $redir" ;;
esac

c=$(codigo -X POST "$URL/api/entrar" -H "Content-Type: application/json" -d '{"pin":"00000000"}')
[ "$c" = "401" ] && paso "un PIN incorrecto se rechaza" || falla "PIN incorrecto acepta ($c)"

c=$(codigo -c "$COOKIES" -X POST "$URL/api/entrar" \
      -H "Content-Type: application/json" -d "{\"pin\":\"$PIN\"}")
if [ "$c" = "200" ]; then paso "el PIN correcto abre sesión"
else falla "el PIN correcto devuelve $c" "revisa APP_PIN en Vercel"; echo; exit 1; fi

grep -q "nm_sesion" "$COOKIES" && paso "cookie de sesión emitida" || falla "no llegó la cookie"

# ─── 3. Registrar un día entero
echo
echo "3. Registro de comidas"
HOY=$(TZ=Europe/Madrid date +%F)
api() { curl -s -b "$COOKIES" "$@"; }

declare -a PLATOS=("desayuno:desayuno-a" "comida:comida-b" "merienda:merienda-a" "cena:cena-b")
for par in "${PLATOS[@]}"; do
  slot="${par%%:*}"; preset="${par##*:}"
  r=$(api -X POST "$URL/api/entries" -H "Content-Type: application/json" \
        -d "{\"slot\":\"$slot\",\"preset_id\":\"$preset\",\"log_date\":\"$HOY\"}")
  if echo "$r" | grep -q '"dish_name"'; then
    kcal=$(echo "$r" | grep -o '"calories":"\?[0-9.]*' | head -1 | tr -d '":a-z')
    paso "$slot → $preset  (${kcal} kcal guardadas)"
  else
    falla "no se guardó $preset" "$(echo "$r" | head -c 200)"
  fi
done

r=$(api "$URL/api/entries?date=$HOY")
n=$(echo "$r" | grep -o '"slot"' | wc -l | tr -d ' ')
[ "$n" = "4" ] && paso "las 4 comidas se leen de Supabase" \
  || falla "se leen $n comidas de 4" "revisa la constraint (user_id, log_date, slot)"

echo "$r" | grep -q '"fat_warning"' \
  && paso "fat_warning viene calculado por Postgres" \
  || falla "falta fat_warning" "¿ejecutaste schema.sql entero?"

# ─── 4. El agente
echo
echo "4. Resumen de Rodrigo"
inicio=$(date +%s)
r=$(api -X POST "$URL/api/daily-summary" -H "Content-Type: application/json" \
      -d "{\"log_date\":\"$HOY\"}")
seg=$(( $(date +%s) - inicio ))

if echo "$r" | grep -q '"rodrigo_feedback"'; then
  nota=$(echo "$r" | grep -o '"score":[0-9]*' | tr -d '"score:')
  paso "resumen generado en ${seg}s (nota ${nota}/10)"
  [ "$seg" -lt 25 ] && paso "dentro del timeout de Vercel" \
    || falla "tardó ${seg}s" "cerca del límite: baja a un modelo -lite"
  echo
  echo "     Rodrigo dice:"
  echo "$r" | sed -n 's/.*"rodrigo_feedback":"\([^"]*\)".*/\1/p' | fold -s -w 66 | sed 's/^/     /'
  echo
  # Segunda llamada: debe venir de caché sin gastar tokens
  r2=$(api -X POST "$URL/api/daily-summary" -H "Content-Type: application/json" \
        -d "{\"log_date\":\"$HOY\"}")
  echo "$r2" | grep -q '"cached":true' && paso "la segunda llamada usa caché" \
    || falla "no cachea" "cada apertura gastaría tokens"
else
  falla "no se generó el resumen" "$(echo "$r" | head -c 300)"
fi

# ─── 5. Deshacer
echo
echo "5. Deshacer"
api -X DELETE "$URL/api/entries?slot=cena&date=$HOY" > /dev/null
r=$(api "$URL/api/entries?date=$HOY")
n=$(echo "$r" | grep -o '"slot"' | wc -l | tr -d ' ')
[ "$n" = "3" ] && paso "quitar una comida funciona" || falla "quedan $n comidas, esperaba 3"

echo "$r" | grep -q '"summary":null' \
  && paso "el resumen se invalida al cambiar una comida" \
  || falla "el resumen sobrevive" "mostraría una nota que ya no corresponde"

# ─── Limpieza
echo
echo "6. Limpieza"
for slot in desayuno comida merienda cena; do
  api -X DELETE "$URL/api/entries?slot=$slot&date=$HOY" > /dev/null
done
r=$(api "$URL/api/entries?date=$HOY")
echo "$r" | grep -q '"entries":\[\]' && paso "día de prueba borrado" \
  || falla "quedan restos" "bórralos con supabase/reset.sql"

echo
echo "──────────────────────────────────────────────────"
printf "%d comprobaciones OK · %d fallos\n" "$ok" "$fallos"
if [ "$fallos" -eq 0 ]; then
  echo
  echo "Listo para instalarlo en su teléfono."
else
  echo
  echo "No se lo des hasta arreglar los fallos de arriba."
  exit 1
fi
