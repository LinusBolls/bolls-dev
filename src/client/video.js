import gsap from "https://cdn.skypack.dev/gsap@3";
import ScrollTrigger from "https://cdn.skypack.dev/gsap@3/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const videos = [
  {
    id: "casablanca-thumbnail",
    numFrames: 117,
  },
  {
    id: "study-planner-thumbnail",
    numFrames: 149,
  },
  {
    id: "medtime-thumbnail",
    numFrames: 318,
  },
  {
    id: "zentio-thumbnail",
    numFrames: 552,
  },
  {
    id: "spaceprogram-thumbnail",
    numFrames: 82,
  },
];

for (const video of videos) {
  const canvas = document.querySelector(
    'canvas[data-video="' + video.id + '"]'
  );
  const ctx = canvas.getContext("2d");
  const current = { i: 0 };
  const images = [];
  const path = (i) =>
    "/videos/" + video.id + "/frame_" + String(i).padStart(4, "0") + ".webp";

  function setCanvasSize() {
    canvas.width = 568 * 10;
    canvas.height = 355 * 10;
  }
  function draw(i) {
    const img = images[i];
    if (!img) return;
    setCanvasSize();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Preload with createImageBitmap for speed (fallback to Image)
  (async () => {
    for (let i = 1; i <= video.numFrames; i++) {
      const res = await fetch(path(i));
      const blob = await res.blob();
      images[i] = await createImageBitmap(blob).catch(async () => {
        const im = new Image();
        im.src = URL.createObjectURL(blob);
        await im.decode();
        return im;
      });
      if (i === 1) draw(1); // draw the first frame as soon as it's available
    }
    ScrollTrigger.create({
      trigger: canvas,
      start: "bottom bottom",
      end: "+=1000",
      pin: false,
      scrub: true,
      onUpdate: (self) => {
        current.i = Math.round(
          gsap.utils.clamp(
            1,
            video.numFrames,
            1 + self.progress * (video.numFrames - 1)
          )
        );
        draw(current.i);
      },
    });
  })();
}
