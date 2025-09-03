#!/usr/bin/env bash

set -euo pipefail

INPUT="assets/favicon.png"
OUTPUT="assets/favicon.ico"
TMPDIR="$(mktemp -d)"
SIZES=(16 32 48 64 128 256)

[[ -f "$INPUT" ]] || { echo "Missing $INPUT" >&2; exit 1; }

echo "Generating favicon sizes from $INPUT..."
for sz in "${SIZES[@]}"; do
  magick "$INPUT" -resize ${sz}x${sz} "$TMPDIR/favicon-${sz}.png"
done

echo "Combining into $OUTPUT..."
magick "$TMPDIR"/*.png "$OUTPUT"

rm -rf "$TMPDIR"
echo "Done: $OUTPUT created."