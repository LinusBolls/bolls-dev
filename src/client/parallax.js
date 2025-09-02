function initParallax() {
  const leftColumn = document.querySelector(".left-column-parallax");
  const rightColumn = document.querySelector(".right-column-parallax");

  function updateParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollProgress = scrollY / (documentHeight - windowHeight);

    if (leftColumn) {
      const leftY = scrollProgress * -384;
      leftColumn.style.transform = `translateY(${leftY}px)`;
    }

    if (rightColumn) {
      const rightY = scrollProgress * 384;
      rightColumn.style.transform = `translateY(${rightY}px)`;
    }
  }
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  updateParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateParallax, { passive: true });
}
initParallax();
