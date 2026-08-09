#!/usr/bin/env bash
# Genera los iconos que necesita la PWA a partir de una imagen cuadrada
# de 1024x1024 o más.
#
#   ./scripts/generar-iconos.sh ~/icono.png
#
# Sin estos archivos, Chrome en Android NO ofrece "Instalar aplicación"
# (el manifest apunta a rutas que darían 404) y en iOS el icono de la
# pantalla de inicio sale como una captura borrosa de la web.
set -euo pipefail

SRC="${1:?Uso: ./scripts/generar-iconos.sh <imagen-cuadrada.png>}"
FONDO="#2E6A57"   # el verde del theme_color, para el relleno del maskable

command -v magick >/dev/null 2>&1 || { echo "Falta ImageMagick."; exit 1; }

magick "$SRC" -resize 192x192 -strip public/icon-192.png
magick "$SRC" -resize 512x512 -strip public/icon-512.png

# Maskable: Android recorta en círculo, rombo o squircle según el fabricante.
# El contenido tiene que caber en el 80% central o se come los bordes.
magick "$SRC" -resize 410x410 \
  -background "$FONDO" -gravity center -extent 512x512 \
  -strip public/icon-maskable-512.png

# iOS no lee el manifest para el icono: usa <link rel="apple-touch-icon">,
# que Next genera solo si existe este archivo en app/.
magick "$SRC" -resize 180x180 -background "$FONDO" -alpha remove \
  -strip app/apple-icon.png

echo "Generados:"
ls -lh public/icon-*.png app/apple-icon.png | awk '{print "  " $9 "  " $5}'
