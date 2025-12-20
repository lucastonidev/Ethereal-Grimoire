function slidebarCharacter() {
  // Configurações
  const CONFIG = {
    cardWidth: 330,
    visibleCards: 3,
  };

  // Elementos DOM
  const sliderContainer = document.querySelector(".slider-container");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  const characterCards = document.querySelectorAll(".character-card");
  
  // Variáveis de estado
  let currentSlide = 0;
  const totalSlides = Math.max(0, characterCards.length - CONFIG.visibleCards);

  // Verifica se todos os elementos necessários existem
  if (!sliderContainer || !prevBtn || !nextBtn || characterCards.length === 0) {
    console.warn("Elementos do slider não encontrados");
    return;
  }

  /**
   * Atualiza a posição do slider e o estado dos botões
   */
  const updateSlider = () => {
    // Calcula o deslocamento baseado na largura do card e slide atual
    const offset = currentSlide * CONFIG.cardWidth;
    sliderContainer.style.transform = `translateX(-${offset}px)`;
    sliderContainer.style.transition = "transform 0.3s ease-in-out";

    // Atualiza estados dos botões
    prevBtn.disabled = currentSlide === 0;
    prevBtn.setAttribute("aria-disabled", currentSlide === 0);

    nextBtn.disabled = currentSlide >= totalSlides;
    nextBtn.setAttribute("aria-disabled", currentSlide >= totalSlides);

    // Adiciona classes CSS para estilização dos botões desabilitados
    prevBtn.classList.toggle("disabled", currentSlide === 0);
    nextBtn.classList.toggle("disabled", currentSlide >= totalSlides);
  };

  /**
   * Avança para o próximo slide
   */
  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      currentSlide++;
      updateSlider();
    }
  };

  /**
   * Retrocede para o slide anterior
   */
  const prevSlide = () => {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  };

  /**
   * Recalcula valores responsivos quando a janela é redimensionada
   */
  const handleResize = () => {
    // Pode adicionar lógica responsiva aqui se necessário
    updateSlider();
  };

  /**
   * Configura os event listeners
   */
  const setupEventListeners = () => {
    // Botões de navegação
    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

    // Navegação por teclado
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    });

    // Suporte a touch/swipe (opcional básico)
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    sliderContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      const minSwipeDistance = 50;
      const distance = touchStartX - touchEndX;

      if (Math.abs(distance) < minSwipeDistance) return;

      if (distance > 0) {
        nextSlide(); // Swipe para esquerda
      } else {
        prevSlide(); // Swipe para direita
      }
    };

    // Redimensionamento da janela
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250); // Debounce
    });
  };

  /**
   * Inicializa o slider
   */
  const init = () => {
    // Configura atributos ARIA para acessibilidade
    sliderContainer.setAttribute("role", "region");
    sliderContainer.setAttribute("aria-label", "Carrossel de personagens");

    prevBtn.setAttribute("aria-label", "Slide anterior");
    nextBtn.setAttribute("aria-label", "Próximo slide");

    // Configura a largura do container para evitar quebra de layout
    sliderContainer.style.width = `${
      characterCards.length * CONFIG.cardWidth
    }px`;

    // Inicializa event listeners
    setupEventListeners();

    // Atualiza estado inicial
    updateSlider();

    // Dispara um evento customizado para notificar inicialização
    document.dispatchEvent(
      new CustomEvent("sliderInitialized", {
        detail: { totalSlides, currentSlide },
      })
    );
  };

  // Inicializa o slider
  init();

  // Retorna métodos públicos para controle externo se necessário
  return {
    next: nextSlide,
    prev: prevSlide,
    goToSlide: (slideIndex) => {
      currentSlide = Math.max(0, Math.min(slideIndex, totalSlides));
      updateSlider();
    },
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => totalSlides,
  };
}

export { slidebarCharacter };