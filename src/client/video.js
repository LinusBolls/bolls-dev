/**
 * each video has 100 frames.
 * for each, we fetch a spritesheet .webp with 10x10 of these frames on it.
 * we draw this webp onto an invisible "staging" canvas.
 * when the user scrolls, we just copy a section of the staging canvas onto the visible canvas.
 *
 * this approach offers
 * - very fast video loading in decent resolution
 * - smooth scrolling
 * - low memory usage (except on mount, when the spritesheet is getting drawn onto the staging canvas)
 *
 * in the future, i'll see if i can use a .mp4 as a spritesheet instead, to make use of inter-frame compression.
 * for the videos i use, an mp4 of the same resolution with the same amount of frames is about 10x smaller (e.g. 3.14MB -> 341KB).
 * this means i could potentially increase the resolution and framerate of the videos at no bandwidth cost.
 *
 * as a drawback, i expect splitting an mp4 into seperate frames in the browser to be very slow and memory intensive.
 * fetching more data is also only half of the equation, i'll also need to store it efficiently.
 * i haven't tested it yet, but i'd expect to be hitting the performance limit of the staging canvas approach with this.
 *
 */

import gsap from "https://cdn.skypack.dev/gsap@3";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// for cache busting the url when we change the videos
const ASSET_CACHE_VERSION = 38;

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

    // alpha: false is more performant, but it will cover up the placeholder webp we use while the video is loading
    // to fix this, the canvas has an inline style of opacity: 0, which we set to 1 after loading
    const ctx = canvas.getContext("2d", { alpha: false });

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

    const dims = { vw: 0, vh: 0, sw: 0, sh: 0 };

    async function loadStagingCanvas() {
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

        await drawStagedSheet();
      }
      dims.vw = vw;
      dims.vh = vh;
      dims.sw = sw;
      dims.sh = sh;
    }

    function sheetPath(sheetIndex) {
      return `/videos/${video.id}/chunk_${String(sheetIndex).padStart(
        4,
        "0"
      )}.webp?v=${ASSET_CACHE_VERSION}`;
    }

    let fetchPromise = null;

    async function drawStagedSheet() {
      // we could leave this out since this function only gets called once on load and then on resize
      // so this will only happen if the user resizes right after page load
      // but it's a bit cleaner to keep this here i think
      if (fetchPromise) return await fetchPromise;

      const now = performance.now();

      fetchPromise = fetch(sheetPath(1), {
        cache: "force-cache",
      });

      const res = await fetchPromise;

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();

      const bmp = await createImageBitmap(blob);

      sctx.drawImage(
        bmp,
        0,
        0,
        bmp.width,
        bmp.height,
        0,
        0,
        staging.width,
        staging.height
      );
      canvas.style.opacity = 1;

      bmp.close();

      fetchPromise = null;

      console.info(
        video.id,
        "loaded in",
        Math.round(performance.now() - now),
        "ms"
      );
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

    const state = { i: 0 };

    let rafScheduled = false;
    let pendingFrame = null;

    // load video and put onto staging canvas before mounting the ScrollTrigger
    await loadStagingCanvas();
    // resize staging canvas on resize
    addEventListener("resize", loadStagingCanvas, { passive: true });

    const st = ScrollTrigger.create({
      trigger: canvas,
      start: isRocket ? "bottom bottom-=20" : "top bottom",
      end: isRocket ? "bottom top-=130" : "bottom top",
      pin: false,
      scrub: true,
      onUpdate: (self) => {
        if (fetchPromise) return; // since we only create the ScrollTrigger after loading, this only happens on resize

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
    // the very first canvas draw after page load is a bit laggy
    // the ScrollTrigger only calls onUpdate once the canvas is scrolled into view, which makes the first page scroll laggy
    // to fix this, we manually call the onUpdate function once after loading the video
    st.vars.onUpdate(st);
  }
}
main();
