#!/usr/bin/env bash

# converts .mov video files to a folder of .webp, which we're using to play the scroll-synced video animations.

set -euo pipefail

names=(study-planner-thumbnail casablanca-thumbnail medtime-thumbnail zentio-thumbnail spaceprogram-thumbnail)

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
done
