#!/usr/bin/env bash

# converts .mov video files to a folder of .webp, which we're using to play the scroll-synced video animations.

set -euo pipefail

names=(study-planner-thumbnail casablanca-thumbnail)

for name in "${names[@]}"; do
  dir="assets/videos/$name"
  rm -rf "$dir"
  mkdir -p "$dir"

  ffmpeg -y -hide_banner \
    -i "assets/${name}.mov" \
    -map 0:v:0 -vf "fps=30,scale=1136:710" \
    -c:v libwebp -q:v 80 -lossless 0 -preset picture \
    -f image2 -update 0 \
    "${dir}/frame_%04d.webp"
done
