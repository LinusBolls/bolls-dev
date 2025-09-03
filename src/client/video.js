import gsap from "https://cdn.skypack.dev/gsap@3";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-scrub spritesheet player (staged canvas blit)
 * - Decodes sheets once (ImageBitmap LRU)
 * - For each sheet, scales it ONCE into a hidden staging canvas sized:
 *     (SHEET_COLS * frameW) x (SHEET_ROWS * frameH)
 * - Each frame = 1:1 blit from staging sub-rect -> visible canvas (no resample)
 * - Creates hidden canvases programmatically (uses OffscreenCanvas when available)
 */

const ASSET_CACHE_VERSION = 36;

const videos = [
  { id: "medtime-thumbnail", numFrames: 100 },
  { id: "zentio-thumbnail", numFrames: 100 },
  { id: "study-planner-thumbnail", numFrames: 100 },
  { id: "casablanca-thumbnail", numFrames: 100 },
  { id: "spaceprogram-thumbnail", numFrames: 100 },
];

const FRAMES_PER_SHEET = 100;
const SHEET_COLS = 10;
const SHEET_ROWS = 10;

const MAX_PIXELS = 4_000_000; // ~4MP/frame budget

// UA knobs
const ua = navigator.userAgent;
const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
const isFirefox = /firefox/i.test(ua);
const PREFETCH_AHEAD = isSafari || isFirefox ? 6 : 12;
const CONCURRENCY = isSafari || isFirefox ? 2 : 4;
const CACHE_LIMIT_SHEETS = isSafari || isFirefox ? 4 : 8;
const HARD_DPR_CAP = isSafari || isFirefox ? 2 : 3;

function computeDPR(rect) {
  const dpr = window.devicePixelRatio || 1;
  const cap = Math.sqrt(MAX_PIXELS / (rect.width * rect.height));
  return Math.max(1, Math.min(dpr, cap || 1, HARD_DPR_CAP));
}

function frameToSheet(frameIndex) {
  const zeroBased = frameIndex - 1;
  const sheetIndex = Math.floor(zeroBased / FRAMES_PER_SHEET) + 1; // 1-based
  const inSheetIdx = zeroBased % FRAMES_PER_SHEET; // 0..99
  const col = inSheetIdx % SHEET_COLS; // 0..9
  const row = Math.floor(inSheetIdx / SHEET_COLS); // 0..9
  return { sheetIndex, inSheetIdx, col, row };
}

function touch(map, key, val) {
  map.delete(key);
  map.set(key, val);
}
function evictLRU(map, limit, onEvict) {
  while (map.size > limit) {
    const [k, v] = map.entries().next().value;
    map.delete(k);
    try {
      onEvict?.(v);
    } catch {}
  }
}

// Concurrency limiter
const queue = [];
let running = 0;
function enqueue(fn) {
  return new Promise((res, rej) => {
    queue.push({ fn, res, rej });
    pump();
  });
}
function pump() {
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

for (const video of videos) {
  const canvas = document.querySelector(`canvas[data-video="${video.id}"]`);
  if (!canvas) continue;
  const ctx = canvas.getContext("2d", { alpha: true }); // setting alpha: false is apparently more performant (can't really tell visually), but makes the canvas opaque, which means or placeholder webp isn't visible through it.

  const extendWC = tempWillChange(canvas, "transform", 180); // prevent page glitching on firefox on scroll with console warning "Will-change memory consumption is too high. Budget limit is the document surface area multiplied by 3 (548595 px). Occurrences of will-change over the budget will be ignored."

  // --- Hidden staging canvas per video ---
  const useOffscreen = typeof OffscreenCanvas !== "undefined";
  const staging = useOffscreen
    ? new OffscreenCanvas(1, 1)
    : document.createElement("canvas");
  if (!useOffscreen) {
    staging.width = 1;
    staging.height = 1;
    staging.style.display = "none";
    staging.setAttribute("aria-hidden", "true");
    // Keep it in DOM so some browsers keep it GPU-backed
    canvas.parentNode?.insertBefore(staging, canvas.nextSibling);
  }
  const sctx = staging.getContext("2d", { alpha: false });
  // Track which sheet is currently staged (0 = none)
  let stagedSheetIndex = 0;
  function sizeCanvases() {
    const rect = canvas.getBoundingClientRect();
    const DPR = computeDPR(rect);
    const vw = Math.max(1, Math.round(rect.width * DPR));
    const vh = Math.max(1, Math.round(rect.height * DPR));

    // Resize visible if needed
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    // Staging must be COLS*vw by ROWS*vh so each frame is 1:1 area
    const sw = SHEET_COLS * vw;
    const sh = SHEET_ROWS * vh;
    if (staging.width !== sw || staging.height !== sh) {
      staging.width = sw;
      staging.height = sh;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.imageSmoothingEnabled = false;
      // Force re-render of current sheet onto staging after resize
      stagedSheetIndex = 0; // invalidate
    }

    // Cache current per-frame dims
    dims.vw = vw;
    dims.vh = vh;
    dims.sw = sw;
    dims.sh = sh;
  }

  const dims = { vw: 0, vh: 0, sw: 0, sh: 0 };

  sizeCanvases();
  addEventListener("resize", sizeCanvases, { passive: true });

  const sheetPath = (sheetIndex) =>
    `/videos/${video.id}/chunk_${String(sheetIndex).padStart(
      4,
      "0"
    )}.webp?v=${ASSET_CACHE_VERSION}`;

  // SHEET cache (ImageBitmap)
  const sheetCache = new Map(); // sheetIndex -> ImageBitmap

  async function decodeSheet(sheetIndex) {
    if (sheetCache.has(sheetIndex)) return sheetCache.get(sheetIndex);
    const res = await fetch(sheetPath(sheetIndex), { cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    touch(sheetCache, sheetIndex, bmp);
    evictLRU(sheetCache, CACHE_LIMIT_SHEETS, (b) => b.close?.());
    return bmp;
  }

  // Draw entire decoded sheet onto staging canvas ONCE per sheet/resize
  // stagedSheetIndex declared above before sizeCanvases() to avoid TDZ; initialized to 0 (none)
  async function ensureStagedSheet(sheetIndex) {
    if (stagedSheetIndex === sheetIndex) return;
    const sheetBmp = await decodeSheet(sheetIndex);
    // Scale the whole sheet to staging dimensions once

    sctx.drawImage(
      sheetBmp,
      0,
      0,
      sheetBmp.width,
      sheetBmp.height,
      0,
      0,
      staging.width,
      staging.height
    );
    stagedSheetIndex = sheetIndex;
  }

  function blitFrameFromStaging(frameIndex) {
    const { col, row } = frameToSheet(frameIndex);
    const sx = col * dims.vw;
    const sy = row * dims.vh;
    // 1:1 copy: no scaling during blit
    ctx.drawImage(staging, sx, sy, dims.vw, dims.vh, 0, 0, dims.vw, dims.vh);
  }

  // Kick off with sheet 1
  let currentSheetIndex = 1;
  const state = { i: 1 };

  enqueue(() => ensureStagedSheet(1)).then(() => {
    blitFrameFromStaging(1);
  });

  const isRocket = video.id === "spaceprogram-thumbnail";

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
      if (next === state.i) return;
      state.i = next;

      // Prefetch nearby sheets
      const start = Math.max(1, next - PREFETCH_AHEAD);
      const end = Math.min(video.numFrames, next + PREFETCH_AHEAD);
      const neededSheets = new Set();
      for (let j = start; j <= end; j++)
        neededSheets.add(frameToSheet(j).sheetIndex);
      for (const s of neededSheets)
        if (!sheetCache.has(s)) enqueue(() => decodeSheet(s));

      // Stage active sheet (if changed) then blit frame
      enqueue(async () => {
        const { sheetIndex } = frameToSheet(next);
        if (sheetIndex !== currentSheetIndex) {
          await ensureStagedSheet(sheetIndex);
          currentSheetIndex = sheetIndex;
        } else if (stagedSheetIndex !== sheetIndex) {
          // Handle resize invalidation: restage current sheet
          await ensureStagedSheet(sheetIndex);
        }
        blitFrameFromStaging(next);
      });
      extendWC();
    },
    onLeave: () => {
      canvas.style.willChange = "";
    },
    onLeaveBack: () => {
      canvas.style.willChange = "";
    },
  });
}

function tempWillChange(el, prop = "transform", ttl = 200) {
  if (!el) return () => {};
  // Only set if not already present
  const old = el.style.willChange;
  if (!old) el.style.willChange = prop;

  let timer = null;
  const scheduleClear = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // Clear only if we were the ones who set it
      if (el.style.willChange === prop) el.style.willChange = "";
    }, ttl);
  };

  return scheduleClear; // call after each burst to extend TTL
}
