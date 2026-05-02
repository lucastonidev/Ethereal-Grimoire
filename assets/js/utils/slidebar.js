function slidebarCharacter() {
  const sliderContainer = document.querySelector(".slider-container");
  const prevBtn         = document.querySelector(".slider-btn.prev");
  const nextBtn         = document.querySelector(".slider-btn.next");
  const dotsContainer   = document.getElementById("slider-dots");

  if (!sliderContainer || !prevBtn || !nextBtn) return;

  const cards = document.querySelectorAll(".character-card");
  const total = cards.length;
  if (total === 0) return;

  const CARD_WIDTH = 325; // card min-width (300) + gap (25)
  let visible      = Math.max(1, Math.floor(
    (sliderContainer.closest(".slider-track")?.offsetWidth || 325) / CARD_WIDTH
  ));
  let maxSlide     = Math.max(0, total - visible);
  let current      = 0;

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    for (let i = 0; i <= maxSlide; i++) {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer?.querySelectorAll(".slider-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxSlide));
    sliderContainer.style.transform = `translateX(-${current * CARD_WIDTH}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxSlide;
    updateDots();
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  // Swipe touch
  let touchStartX = 0;
  sliderContainer.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  sliderContainer.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Resize com debounce
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      visible  = Math.max(1, Math.floor(
        (sliderContainer.closest(".slider-track")?.offsetWidth || 325) / CARD_WIDTH
      ));
      maxSlide = Math.max(0, total - visible);
      buildDots();
      goTo(Math.min(current, maxSlide));
    }, 200);
  });

  buildDots();
  goTo(0);
}

export { slidebarCharacter };
