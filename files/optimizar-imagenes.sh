#!/usr/bin/env bash
# Prepara las 12 fotos del catálogo para producción.
#
#   brew install imagemagick     # macOS
#   sudo apt install imagemagick # Linux
#
#   ./scripts/optimizar-imagenes.sh ~/Fotos/platos
#
# Espera encontrar en la carpeta de origen un archivo por plato cuyo nombre
# empiece por el id (desayuno-a.HEIC, comida-b_final.jpg, cena-d.png...).
set -euo pipefail

ORIGEN="${1:-fotos-originales}"
DESTINO="public/meals"
LADO=800      # con sizes="88px", next/image reescala; 800 da margen en retina
CALIDAD=82

PLATOS=(desayuno-a desayuno-b desayuno-c comida-a comida-b
        merienda-a merienda-b cena-a cena-b cena-c cena-d cena-e)

command -v magick >/dev/null 2>&1 || { echo "Falta ImageMagick."; exit 1; }
[ -d "$ORIGEN" ] || { echo "No existe la carpeta $ORIGEN"; exit 1; }
mkdir -p "$DESTINO"

faltan=0
for id in "${PLATOS[@]}"; do
  src=$(find "$ORIGEN" -maxdepth 1 -type f -iname "${id}*" | head -1 || true)
  if [ -z "$src" ]; then
    echo "  FALTA   $id"
    faltan=$((faltan + 1))
    continue
  fi

  # -auto-orient  respeta la rotación del móvil antes de recortar
  # -strip        BORRA EXIF, incluido el GPS. Son fotos hechas en su casa.
  magick "$src" \
    -auto-orient \
    -resize "${LADO}x${LADO}^" \
    -gravity center -extent "${LADO}x${LADO}" \
    -strip \
    -quality "$CALIDAD" \
    -interlace Plane \
    "$DESTINO/${id}.jpg"

  peso=$(du -h "$DESTINO/${id}.jpg" | cut -f1)
  echo "  OK      ${id}.jpg  (${peso})"
done

echo
if [ "$faltan" -gt 0 ]; then
  echo "Faltan $faltan fotos. La app enseñará un hueco gris en esos platos."
  exit 1
fi
echo "Las 12 listas en $DESTINO/"
du -ch "$DESTINO"/*.jpg | tail -1
