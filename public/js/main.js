import { slidebarCharacter } from "./utils/slidebar.js";
import { UI } from "./utils/ui.js";

class App {
  constructor() {
    this.baseUrl = "/api/v1/";
    this.ui = new UI();
    this.init();
  }

  init() {
    this._setupNavScroll();
    this._setupMobileMenu();
    this._setupSmoothScroll();
    this._setupFadeIn();
    this._renderSkeletons();
    this.fetchMainCharacters();
    this.fetchSpells();
    this.fetchHouses();
  }

  _setupNavScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;
    window.addEventListener(
      "scroll",
      () => {
        header.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true },
    );
  }

  _setupMobileMenu() {
    const btn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.getElementById("nav-links");
    const overlay = document.getElementById("mobile-overlay");
    if (!btn || !navLinks) return;

    // Função central para abrir/fechar o menu
    const toggleMenu = (forceClose = false) => {
      const isCurrentlyExpanded = btn.getAttribute("aria-expanded") === "true";
      const willExpand = forceClose ? false : !isCurrentlyExpanded;

      btn.setAttribute("aria-expanded", String(willExpand));
      navLinks.classList.toggle("active", willExpand);

      // Controla o fundo escuro e a trava de rolagem
      if (overlay) overlay.classList.toggle("active", willExpand);
      document.body.classList.toggle("menu-open", willExpand);

      // Troca o ícone (Hamburguer <-> X)
      btn.innerHTML = willExpand
        ? '<i class="fas fa-times" aria-hidden="true"></i>'
        : '<i class="fas fa-bars" aria-hidden="true"></i>';
    };

    // Clique no botão
    btn.addEventListener("click", () => toggleMenu());

    // Fechar ao clicar no fundo escuro
    if (overlay) {
      overlay.addEventListener("click", () => toggleMenu(true));
    }

    // Fechar ao clicar em qualquer link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(true));
    });
  }

  _setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (id === "#") return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  _setupFadeIn() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
  }

  _renderSkeletons() {
    const container = document.getElementById("main-character");
    if (container) this.ui.renderSkeletons(container, 4);
  }

  renderSpells(data) {
    const container = document.getElementById("spells-grid");
    if (!container) return;

    this.spellsGrid = container;
    if (!data || data.length === 0) {
      this.spellsGrid.innerHTML = "<p>Nenhum feitiço encontrado.</p>";
      return;
    }

    this.spellsGrid.innerHTML = "";
    data.forEach((spell) => {
      const spellCard = document.createElement("article");
      spellCard.className = "spell-card";

      // Captura o encantamento original (costuma vir na propriedade 'spell' ou 'originalName')
      const originalIncantation = spell.spell || spell.originalName || "";

      spellCard.innerHTML = `
        <div class="spell-card__header">
          <h3 class="spell-card__title">${spell.name}</h3>
          <span class="spell-type-badge spell-type-charm">${spell.category || "Desconhecido"}</span>
        </div>
        <div class="spell-card__body">
          ${originalIncantation ? `<p class="spell-pronunciation" style="color: var(--gold);"><strong>Encantamento:</strong> <em>${originalIncantation}</em></p>` : ""}
          <p class="spell-desc">${spell.use}</p>
        </div>
      `;
      this.spellsGrid.appendChild(spellCard);
    });
  }

  async fetchMainCharacters() {
    const container = document.getElementById("main-character");
    if (!container) return;

    try {
      // Busca os dados na sua nova API
      const allData = await fetch(`${this.baseUrl}characters`).then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      });

      this.ui.clearSkeletons(container);

      const charactersToDisplay = allData.slice(0, 3);

      charactersToDisplay.forEach((data) => this.ui.mainCharacters(data));
      slidebarCharacter();
    } catch (err) {
      console.error("Erro ao buscar personagens:", err);
      this.ui.clearSkeletons(container);
      container.innerHTML = `
        <div style="padding:var(--space-8);color:var(--text-muted);text-align:center;width:100%">
          <p>Não foi possível carregar os personagens no momento.</p>
        </div>`;
    }
  }

  async fetchSpells() {
    const container = document.getElementById("spells-grid");
    if (!container) return;

    try {
      const res = await fetch(`${this.baseUrl}spells`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();

      const topSpells = data.slice(0, 5);
      container.innerHTML = "";

      this.renderSpells(topSpells);
    } catch (err) {
      console.error("Erro ao buscar feitiços:", err);
      container.innerHTML = `
        <div style="padding:var(--space-8);color:var(--text-muted);text-align:center;grid-column:1/-1">
          <p>Não foi possível carregar os feitiços no momento.</p>
        </div>`;
    }
  }

  async fetchHouses() {
    const container = document.getElementById("houses-grid");
    if (!container) return;

    try {
      const res = await fetch(`${this.baseUrl}houses`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      container.innerHTML = "";
      data.forEach((house) => this.ui.renderHouse(house));
    } catch (err) {
      console.error("Erro ao buscar casas:", err);
      container.innerHTML = `
        <div style="padding:var(--space-8);color:var(--text-muted);text-align:center;grid-column:1/-1">
          <p>Não foi possível carregar as casas no momento.</p>
        </div>`;
    }
  }
}

new App();
export { App };
