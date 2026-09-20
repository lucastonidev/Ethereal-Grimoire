import { UI } from "../utils/ui.js";
import { App } from "../main.js";

class CharactersPage {
  constructor() {
    this.ui = new UI();
    this.container = document.getElementById("characters-grid");
    this.allCharacters = [];

    // Mapeamento dos SVGs por casa
    this.houseIcons = {
      gryffindor:
        "https://lucastonidev.github.io/ethereal-data/image/houses/gryffindor.png",
      slytherin:
        "https://lucastonidev.github.io/ethereal-data/image/houses/slytherin.png",
      ravenclaw:
        "https://lucastonidev.github.io/ethereal-data/image/houses/ravenclaw.png",
      hufflepuff:
        "https://lucastonidev.github.io/ethereal-data/image/houses/hufflepuff.png",
      unknown: "",
    };

    this.init();
    new App()._setupMobileMenu();
  }

  async init() {
    this.setupModal();
    await this.fetchCharacters();
    this.setupFilters();
  }

  async fetchCharacters() {
    this.ui.renderSkeletons(this.container, 8);
    try {
      const res = await fetch("/api/v1/characters");
      if (!res.ok) throw new Error("Erro na API");

      this.allCharacters = await res.json();
      this.ui.clearSkeletons(this.container);
      this.renderList(this.allCharacters);
    } catch (error) {
      console.error(error);
      this.ui.clearSkeletons(this.container);
      this.container.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">Não foi possível carregar os personagens no momento.</p>`;
    }
  }

  renderList(characters) {
    this.container.innerHTML = "";

    characters.forEach((char) => {
      const houseClass = this.ui._getHouseClass(char.hogwartsHouse);
      const fallbackImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.fullName)}&background=12131f&color=c9a227&size=220&bold=true`;
      const imgSrc =
        char.image && char.image.startsWith("http") ? char.image : fallbackImg;

      const card = document.createElement("article");
      card.className = `magic-portrait house-${houseClass}`;
      card.setAttribute("tabindex", "0");

      card.innerHTML = `
        <div class="portrait-img-wrapper">
          <img src="${imgSrc}" alt="Foto de ${char.fullName}" class="portrait-img" loading="lazy" onerror="this.src='${fallbackImg}'">
          <div class="portrait-data">
            <h3 class="char-name">${char.fullName}</h3>
            <p class="char-role">${char.interpretedBy || "Bruxo"}</p>
            <div class="char-stats">
              ${char.hogwartsHouse ? `<div class="stat-row"><span class="stat-label">Casa</span><span class="stat-value">${char.hogwartsHouse}</span></div>` : ""}
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () =>
        this.openModal(char, imgSrc, houseClass),
      );
      this.container.appendChild(card);
    });
  }

  setupFilters() {
    const btns = document.querySelectorAll(".house-filter-btn");
    btns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        btns.forEach((b) => b.classList.remove("active"));
        const target = e.currentTarget;
        target.classList.add("active");

        const house = target.dataset.house;
        if (house === "all") {
          this.renderList(this.allCharacters);
        } else {
          const filtered = this.allCharacters.filter(
            (c) => this.ui._getHouseClass(c.hogwartsHouse) === house,
          );
          this.renderList(filtered);
        }
      });
    });
  }

  openModal(char, imgSrc, houseClass) {
    const modal = document.getElementById("char-modal");

    // Informações Básicas
    document.getElementById("modal-img").src = imgSrc;
    document.getElementById("modal-name").innerText = char.fullName;
    document.getElementById("modal-aka").innerText = char.nickname
      ? `"${char.nickname}"`
      : "";
    document.getElementById("modal-actor").innerText =
      char.interpretedBy || "Desconhecido";
    document.getElementById("modal-birth").innerText =
      char.birthdate || "Desconhecido";

    // Função auxiliar para capitalizar palavras
    const capitalize = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    // ── ATUALIZANDO PATRONO ── //
    document.getElementById("modal-patronus").innerText = char.patronus
      ? capitalize(char.patronus)
      : "Nenhum/Desconhecido";

    // ── ATUALIZANDO VARINHA ── //
    let wandStr = "Desconhecida";
    if (char.wand) {
      if (typeof char.wand === "object" && (char.wand.wood || char.wand.core)) {
        const wood = char.wand.wood || "Madeira desc.";
        const core = char.wand.core || "Núcleo desc.";
        const len = char.wand.length ? char.wand.length + '"' : "";
        wandStr = `${capitalize(wood)}, ${capitalize(core)} ${len}`.trim();
      } else if (typeof char.wand === "string" && char.wand.trim() !== "") {
        wandStr = char.wand;
      }
    }
    document.getElementById("modal-wand").innerText = wandStr;

    // ── ESTILIZANDO A LOGO E A BORDA COM A COR DA CASA ── //
    const badgeContainer = document.getElementById("modal-house-badge");
    const imgWrapper = document.getElementById("modal-house-glow");

    // Mapeamento de cores mágicas
    const houseColors = {
      gryffindor: "var(--gryffindor-red)",
      slytherin: "var(--slytherin-green)",
      ravenclaw: "var(--ravenclaw-blue)",
      hufflepuff: "var(--hufflepuff-yellow)",
      unknown: "var(--text-muted)",
    };

    const currentColor = houseColors[houseClass] || "var(--gold)";

    // Atualiza a Logo (Usando CSS Mask)
    if (this.houseIcons[houseClass]) {
      badgeContainer.style.webkitMaskImage = `url('${this.houseIcons[houseClass]}')`;
      badgeContainer.style.maskImage = `url('${this.houseIcons[houseClass]}')`;
      badgeContainer.style.backgroundColor = currentColor;
      badgeContainer.style.display = "block";
    } else {
      badgeContainer.style.display = "none";
    }

    // Atualiza a Borda da Foto
    imgWrapper.style.borderColor = currentColor;

    // Exibe o modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  setupModal() {
    const modal = document.getElementById("char-modal");
    const closeBtn = document.getElementById("close-modal");

    const close = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    };

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }
}

new CharactersPage();
