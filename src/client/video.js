import gsap from "https://cdn.skypack.dev/gsap@3";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ASSET_CACHE_VERSION = 37;

const numFrames = 100;
const sheetCols = 10;
const sheetRows = 10;

const videos = [
  { id: "medtime-thumbnail", numFrames, sheetCols, sheetRows },
  { id: "zentio-thumbnail", numFrames, sheetCols, sheetRows },
  { id: "study-planner-thumbnail", numFrames, sheetCols, sheetRows },
  { id: "casablanca-thumbnail", numFrames, sheetCols, sheetRows },
  { id: "spaceprogram-thumbnail", numFrames, sheetCols, sheetRows },
];

const ua = navigator.userAgent;
const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
const isFirefox = /firefox/i.test(ua);

const MAX_PIXELS = 4_000_000; // ~4MP/frame budget
const HARD_DPR_CAP = isSafari || isFirefox ? 2 : 3;

function computeDPR(rect) {
  const dpr = window.devicePixelRatio || 1;
  const cap = Math.sqrt(MAX_PIXELS / (rect.width * rect.height));
  return Math.max(1, Math.min(dpr, cap || 1, HARD_DPR_CAP));
}

async function main() {
  for (const video of videos) {
    const canvas = document.querySelector(`canvas[data-video="${video.id}"]`);

    if (!canvas) continue;

    const ctx = canvas.getContext("2d", { alpha: false });

    const useOffscreen = typeof OffscreenCanvas !== "undefined";

    let loading = null;

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

    const dims = { vw: 0, vh: 0, sw: 0, sh: 0 };

    async function sizeCanvases() {
      const rect = canvas.getBoundingClientRect();
      const DPR = computeDPR(rect);
      const vw = Math.max(1, Math.round(rect.width * DPR));
      const vh = Math.max(1, Math.round(rect.height * DPR));

      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }

      const sw = video.sheetCols * vw;
      const sh = video.sheetRows * vh;
      if (staging.width !== sw || staging.height !== sh) {
        staging.width = sw;
        staging.height = sh;
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.imageSmoothingEnabled = false;

        await ensureStagedSheet();
      }
      dims.vw = vw;
      dims.vh = vh;
      dims.sw = sw;
      dims.sh = sh;
    }
    await sizeCanvases();
    addEventListener("resize", sizeCanvases, { passive: true });

    function sheetPath(sheetIndex) {
      return `/videos/${video.id}/chunk_${String(sheetIndex).padStart(
        4,
        "0"
      )}.webp?v=${ASSET_CACHE_VERSION}`;
    }

    async function ensureStagedSheet() {
      if (loading) return await loading.promise;

      loading = defer();

      const res = await fetch(sheetPath(1), { cache: "force-cache" });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();

      const sheetBmp = await createImageBitmap(blob);

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
      loading.resolve();
      loading = null;

      sheetBmp.close();
    }

    function frameToSheet(frameIndex) {
      const zeroBased = frameIndex - 1;
      const sheetIndex = Math.floor(zeroBased / video.numFrames) + 1; // 1-based
      const inSheetIdx = zeroBased % video.numFrames; // 0..99
      const col = inSheetIdx % video.sheetCols; // 0..9
      const row = Math.floor(inSheetIdx / video.sheetCols); // 0..9
      return { sheetIndex, inSheetIdx, col, row };
    }

    function blitFrameFromStaging(frameIndex) {
      const { col, row } = frameToSheet(frameIndex);
      const sx = col * dims.vw;
      const sy = row * dims.vh;
      ctx.drawImage(staging, sx, sy, dims.vw, dims.vh, 0, 0, dims.vw, dims.vh);
    }

    const isRocket = video.id === "spaceprogram-thumbnail";

    const state = { i: 1 };

    let rafScheduled = false;
    let pendingFrame = null;

    ScrollTrigger.create({
      trigger: canvas,
      start: isRocket ? "bottom bottom-=20" : "top bottom",
      end: isRocket ? "bottom top-=130" : "bottom top",
      pin: false,
      scrub: true,
      onUpdate: (self) => {
        if (loading) return;

        const next = Math.round(
          gsap.utils.clamp(
            1,
            video.numFrames,
            1 + self.progress * (video.numFrames - 1)
          )
        );
        if (next === state.i) return;
        state.i = next;
        pendingFrame = next;

        if (!rafScheduled) {
          rafScheduled = true;
          requestAnimationFrame(() => {
            rafScheduled = false;
            // draw only the latest requested frame
            if (pendingFrame != null) {
              blitFrameFromStaging(pendingFrame);
              pendingFrame = null;
            }
          });
        }
      },
      onLeave: () => {
        canvas.style.willChange = "";
      },
      onLeaveBack: () => {
        canvas.style.willChange = "";
      },
    });
  }
}

function defer() {
  let resolve, reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
main();
