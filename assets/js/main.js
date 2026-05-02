import { slidebarCharacter } from "./utils/slidebar.js";
import { ArrayLoader }       from "./utils/lazy-load.js";
import { UI }                from "./utils/ui.js";

class App {
  constructor() {
    this.baseUrl = "https://potterapi-fedeperin.vercel.app/pt/";
    this.ui      = new UI();
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
  }

  _setupNavScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  _setupMobileMenu() {
    const btn      = document.querySelector(".mobile-menu-btn");
    const navLinks = document.getElementById("nav-links");
    if (!btn || !navLinks) return;

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
      btn.querySelector("i").className = expanded ? "fas fa-bars" : "fas fa-times";
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
        btn.querySelector("i").className = "fas fa-bars";
      });
    });
  }

  _setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
  }

  _renderSkeletons() {
    const container = document.getElementById("main-character");
    if (container) this.ui.renderSkeletons(container, 4);
  }

  async fetchMainCharacters() {
    const characters = ["harry", "hermione", "ron", "dumbledore", "snape", "voldemort", "sirius", "lupin"];
    const container  = document.getElementById("main-character");

    try {
      const promises = characters.map(name =>
        fetch(`${this.baseUrl}characters?search=${name}`)
          .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
      );
      const allData = await Promise.all(promises);

      this.ui.clearSkeletons(container);
      allData.forEach(data => this.ui.mainCharacters(data));
      slidebarCharacter();
    } catch (err) {
      console.error("Erro ao buscar personagens:", err);
      if (container) {
        this.ui.clearSkeletons(container);
        container.innerHTML = `
          <div style="padding:var(--space-8);color:var(--text-muted);text-align:center;width:100%">
            <p>Não foi possível carregar os personagens no momento.</p>
          </div>`;
      }
    }
  }

  async fetchSpells() {
    const container = document.getElementById("spells-grid");
    const btn       = document.getElementById("loadMoreBtn");

    try {
      const res  = await fetch(`${this.baseUrl}spells`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();

      new ArrayLoader(data, {
        container,
        button: btn,
        initialItems: 21,
        itemsPerLoad: 12,
      });
    } catch (err) {
      console.error("Erro ao buscar feitiços:", err);
      if (container) {
        container.innerHTML = `
          <div style="padding:var(--space-8);color:var(--text-muted);text-align:center;grid-column:1/-1">
            <p>Não foi possível carregar os feitiços no momento.</p>
          </div>`;
      }
    }
  }
}

new App();
