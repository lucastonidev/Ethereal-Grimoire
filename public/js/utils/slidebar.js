function slidebarCharacter() {
  const sliderContainer = document.querySelector(".slider-container");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  const dotsContainer = document.getElementById("slider-dots");

  if (!sliderContainer) return;

  const cards = sliderContainer.querySelectorAll(".character-card");
  const total = cards.length;
  if (total === 0) return;

  // 1. Constrói os dots (bolinhas) de navegação
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  // 2. Atualiza estado das setas e dots com base no scroll
  function updateState() {
    const firstCard = cards[0];
    if (!firstCard) return;
    const gap = parseInt(window.getComputedStyle(sliderContainer).gap) || 20;
    const cardWidth = firstCard.offsetWidth + gap;

    // Calcula qual card está no centro da visão
    const currentIndex = Math.round(sliderContainer.scrollLeft / cardWidth);

    if (dotsContainer) {
      dotsContainer.querySelectorAll(".slider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === currentIndex);
      });
    }

    if (prevBtn) prevBtn.disabled = sliderContainer.scrollLeft <= 5;
    if (nextBtn) {
      const maxScroll =
        sliderContainer.scrollWidth - sliderContainer.clientWidth;
      nextBtn.disabled = sliderContainer.scrollLeft >= maxScroll - 5;
    }
  }

  // 3. Move via Botões ou Dots
  function goTo(index) {
    const firstCard = cards[0];
    if (!firstCard) return;
    const gap = parseInt(window.getComputedStyle(sliderContainer).gap) || 20;
    const cardWidth = firstCard.offsetWidth + gap;

    sliderContainer.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const gap = parseInt(window.getComputedStyle(sliderContainer).gap) || 20;
      const cardWidth = cards[0].offsetWidth + gap;
      sliderContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const gap = parseInt(window.getComputedStyle(sliderContainer).gap) || 20;
      const cardWidth = cards[0].offsetWidth + gap;
      sliderContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
    });
  }

  // Escuta o scroll nativo (disparado ao deslizar no celular)
  let isScrolling;
  sliderContainer.addEventListener("scroll", () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(updateState, 50);
  });

  // --- MOUSE DRAG (Para funcionar arrastando o mouse no PC também) ---
  let isDown = false;
  let startX;
  let scrollLeft;

  sliderContainer.addEventListener("mousedown", (e) => {
    isDown = true;
    sliderContainer.style.scrollBehavior = "auto"; // Tira a suavidade para o arraste ser preciso
    sliderContainer.style.scrollSnapType = "none"; // Desliga o ímã provisoriamente
    startX = e.pageX - sliderContainer.offsetLeft;
    scrollLeft = sliderContainer.scrollLeft;
  });

  sliderContainer.addEventListener("mouseleave", () => {
    if (!isDown) return;
    isDown = false;
    sliderContainer.style.scrollBehavior = "smooth";
    sliderContainer.style.scrollSnapType = "x mandatory";
    updateState();
  });

  sliderContainer.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    sliderContainer.style.scrollBehavior = "smooth";
    sliderContainer.style.scrollSnapType = "x mandatory";
    updateState();
  });

  sliderContainer.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderContainer.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador de velocidade do arraste
    sliderContainer.scrollLeft = scrollLeft - walk;
  });

  buildDots();

  // Pequeno delay inicial para garantir que o CSS já calculou as larguras na tela
  setTimeout(updateState, 100);
}

export { slidebarCharacter };
