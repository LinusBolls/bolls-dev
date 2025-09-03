#!/usr/bin/env bash

# converts .mov video files to a folder of .webp, which we're using to play the scroll-synced video animations.

set -euo pipefail

names=(study-planner-thumbnail casablanca-thumbnail medtime-thumbnail zentio-thumbnail spaceprogram-thumbnail)

FRAMES=100
PER_SHEET=100
SHEET_COLS=10
QUALITY=80 # WebP quality for the spritesheet

for name in "${names[@]}"; do
  dir="assets/videos/$name"
  rm -rf "$dir"
  mkdir -p "$dir"

  ffmpeg -y -hide_banner \
    -i "assets/${name}.mov" \
    -vf "fps=100/$(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/${name}.mov),scale=1104:690" \
    -frames:v 100 \
    -c:v libwebp -q:v 80 -lossless 0 -preset picture \
    "${dir}/frame_%04d.webp"

  total_sheets=$(( (FRAMES + PER_SHEET - 1) / PER_SHEET ))
  for s in $(seq 1 "$total_sheets"); do
    start=$(( (s - 1) * PER_SHEET + 1 ))
    end=$(( start + PER_SHEET - 1 ))
    (( end > FRAMES )) && end=$FRAMES

    inputs=()
    for i in $(seq "$start" "$end"); do
      inputs+=("${dir}/frame_$(printf '%04d' "$i").webp")
    done

    count=${#inputs[@]}
    cols=$(( count < SHEET_COLS ? count : SHEET_COLS ))
    rows=$(( (count + cols - 1) / cols ))   # ceil(count/cols)

    # One static spritesheet (no animation): tile = cols x rows
    if command -v magick >/dev/null 2>&1; then
      magick montage "${inputs[@]}" -tile "${cols}x${rows}" -geometry +0+0 \
        -quality "$QUALITY" "${dir}/chunk_$(printf '%04d' "$s").webp"
    else
      montage "${inputs[@]}" -tile "${cols}x${rows}" -geometry +0+0 \
        -quality "$QUALITY" "${dir}/chunk_$(printf '%04d' "$s").webp"
    fi
  done
done
