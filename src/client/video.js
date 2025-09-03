import gsap from "https://cdn.skypack.dev/gsap@3";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const ASSET_CACHE_VERSION = 5;

const videos = [
  {
    id: "medtime-thumbnail",
    numFrames: 100,
  },
  {
    id: "zentio-thumbnail",
    numFrames: 100,
  },
  {
    id: "study-planner-thumbnail",
    numFrames: 100,
  },
  {
    id: "casablanca-thumbnail",
    numFrames: 100,
  },
  {
    id: "spaceprogram-thumbnail",
    numFrames: 100,
  },
];

const MAX_PIXELS = 4_000_000; // ~4MP/frame budget; adjust to 6–8MP if safe
function computeDPR(rect) {
  const dpr = window.devicePixelRatio || 1;
  const cap = Math.sqrt(MAX_PIXELS / (rect.width * rect.height));
  return Math.max(1, Math.min(dpr, cap || 1, 3)); // hard-cap at 3x
}
const CACHE_LIMIT = 30; // keep ~30 frames max in memory
const PREFETCH_AHEAD = 12; // window size ahead/behind
const CONCURRENCY = 4; // cap concurrent fetch/decodes

for (const video of videos) {
  const canvas = document.querySelector(`canvas[data-video="${video.id}"]`);
  const ctx = canvas.getContext("2d", { alpha: false });

  // Set canvas once based on its CSS size
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const DPR = computeDPR(rect);
    canvas.width = Math.round(rect.width * DPR);
    canvas.height = Math.round(rect.height * DPR);
    // draw in device pixels; no scaling transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false; // 1:1 → crisp
  }
  sizeCanvas();
  addEventListener("resize", sizeCanvas, { passive: true });

  const path = (i) =>
    `/videos/${video.id}/frame_${String(i).padStart(
      4,
      "0"
    )}.webp?v=${ASSET_CACHE_VERSION}`;

  // LRU cache with eviction
  const cache = new Map(); // i -> ImageBitmap|HTMLImageElement
  function touch(i, val) {
    cache.delete(i);
    cache.set(i, val);
  }
  function evictIfNeeded() {
    while (cache.size > CACHE_LIMIT) {
      const [oldestI, val] = cache.entries().next().value;
      cache.delete(oldestI);
      if (val && "close" in val) {
        try {
          val.close();
        } catch {}
      }
    }
  }

  // Simple queue to limit concurrency
  const queue = [];
  let running = 0;
  async function enqueue(fn) {
    return new Promise((res, rej) => {
      queue.push({ fn, res, rej });
      pump();
    });
  }
  async function pump() {
    while (running < CONCURRENCY && queue.length) {
      const { fn, res, rej } = queue.shift();
      running++;
      fn()
        .then(res, rej)
        .finally(() => {
          running--;
          pump();
        });
    }
  }

  async function decodeFrame(i) {
    if (cache.has(i)) return cache.get(i);
    // Fetch
    const res = await fetch(path(i), { cache: "force-cache" });
    const blob = await res.blob();

    // Try ImageBitmap with resize to canvas size for lower memory
    const targetW = canvas.width;
    const targetH = canvas.height;
    let bmp;
    try {
      bmp = await createImageBitmap(blob, {
        resizeWidth: targetW,
        resizeHeight: targetH,
        // resizeQuality: "high", // optional; Safari may ignore
      });
      touch(i, bmp);
    } catch {
      // Fallback to <img>
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      URL.revokeObjectURL(url);
      touch(i, img);
    }
    evictIfNeeded();
    return cache.get(i);
  }

  function draw(i) {
    const frame = cache.get(i);
    if (!frame) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height); // 1:1 in device px
  }

  // Kick off first frame quickly
  enqueue(() => decodeFrame(1)).then(() => draw(1));

  const isRocket = video.id === "spaceprogram-thumbnail";

  // Scroll-driven playback with lazy loading + prefetch window
  const state = { i: 1 };
  ScrollTrigger.create({
    trigger: canvas,
    start: isRocket ? "bottom bottom-=20" : "top bottom",
    end: isRocket ? "bottom top-=130" : "bottom top",
    pin: false,
    scrub: true,
    onUpdate: (self) => {
      const next = Math.round(
        gsap.utils.clamp(
          1,
          video.numFrames,
          1 + self.progress * (video.numFrames - 1)
        )
      );
      if (next !== state.i) {
        state.i = next;
        // Draw now if available; otherwise will draw when loaded
        if (cache.has(next)) draw(next);
      }
      // Prefetch neighborhood
      const start = Math.max(1, next - PREFETCH_AHEAD);
      const end = Math.min(video.numFrames, next + PREFETCH_AHEAD);
      for (let j = start; j <= end; j++) {
        if (!cache.has(j))
          enqueue(() => decodeFrame(j)).then(() => {
            if (j === state.i) draw(j);
          });
      }
      // Optional: proactively drop far-away frames (kept by LRU anyway)
    },
  });
}
