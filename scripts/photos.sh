#!/usr/bin/env bash
# Web versions of the client's photographs and logo.
#
#   bash scripts/photos.sh
#
# Originals live in assets-src/photos/ (kept out of git: 35 MB of phone
# photos). Outputs are committed under public/ and app/. Needs ImageMagick 7.
# -strip drops EXIF, which on phone photos includes the GPS location.
set -euo pipefail
cd "$(dirname "$0")/.."

src=assets-src/photos
jpeg=(-strip -sampling-factor 4:2:0 -quality 80 -interlace JPEG)

# ---------------------------------------------------------------- Prototype
out=public/images/prototype
mkdir -p "$out"
proto() { magick "$src/prototype/$1" -auto-orient "${@:3}" -resize '2400x2400>' "${jpeg[@]}" "$out/$2"; }
proto 20261118_141307.jpg.jpeg fcu-elevation.jpg
proto 20261118_140948.jpg.jpeg fcu-elevation-mounting-plate.jpg
proto 20261118_141110.jpg.jpeg fcu-three-quarter.jpg
# Shot from above with the shaft vertical; turned so the shaft runs
# horizontally like every other view (a plan, in drawing terms).
proto 20261118_141533.jpg.jpeg fcu-plan.jpg -rotate -90
proto "20261118_141555(1).jpg.jpeg" fcu-plan-mounting-plate.jpg -rotate -90

# ---------------------------------------------------------------- Founders
# Kept at the originals' own 4:3 frame (the two small ones are 389 x 300 and
# are not upscaled): the Leadership cells show them landscape, full width.
out=public/images/team
mkdir -p "$out"
# Augustine's original has uneven white padding; trim it, then re-centre
# on a 4:3 white canvas so head and shoulders sit like the other two.
magick "$src/founders/Augustine.png" -background white -flatten -fuzz 4% -trim +repage -gravity center -extent 1013x760 "${jpeg[@]}" "$out/augustine.jpg"
magick "$src/founders/Infantraj.jpg" "${jpeg[@]}" "$out/infantraj.jpg"
magick "$src/founders/Chandrasekhar.jpg" "${jpeg[@]}" "$out/chandrasekhar.jpg"

# ---------------------------------------------------------------- Events
out=public/images/events
mkdir -p "$out"
event() { magick "$src/events/$1" -auto-orient "${@:3}" -resize '1600x1600>' "${jpeg[@]}" "$out/$2"; }
event 1_ETM2026.jpeg etm-2026.jpg
event 2_MotorExpo.jpeg electric-motor-expo-2026.jpg
event "3_RATA Conclave 2026.jpeg" rata-conclave-2026.jpg
# PitchX: only the award handover panel of the collage (top right), where
# the cheque made out to Infintin is the proof. Drops the hosts' logos.
event "4_PitchX event.jpeg" pitchx-2026-award.jpg -crop 864x648+1002+248 +repage

# ---------------------------------------------------------------- Logo
# The lockup is used as a CSS mask, so only its alpha matters; the emblem
# (left square of the lockup) becomes the favicon, in the brand colours.
mkdir -p public/brand
magick "$src/logo-final.png" -trim +repage -resize 1400x "public/brand/infintin-logo.png"
emblem() { magick "$src/logo-final.png" -trim +repage -gravity west -crop 788x788+0+0 +repage -background none -gravity center -extent 800x800 "$@"; }
emblem -resize 512x512 app/icon.png
emblem -background white -flatten -resize 160x160 -gravity center -extent 180x180 app/apple-icon.png
emblem -define icon:auto-resize=48,32,16 app/favicon.ico

ls -la public/images/* public/brand app/icon.png app/apple-icon.png app/favicon.ico
