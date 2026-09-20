import { Toast } from "../components/toast.js";
import { App } from "../main.js";


class SpellPage {
  constructor() {
    this.spellsGrid = document.getElementById("spells-grid");
    this.data = null;
    this.toast = new Toast();
    new App()._setupMobileMenu();
  }

  async fetchSpells() {
    try {
      const response = await fetch("/api/v1/spells");
      if (!response.ok) {
        throw new Error("Erro ao buscar feitiços");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar feitiços:", error);
      return [];
    }
  }

  renderSpells(data = this.data) {
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

  searchSpells() {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();

      // Agora o filtro pesquisa tanto pelo nome traduzido quanto pelo encantamento original!
      const filteredSpells = this.data.filter((spell) => {
        const name = (spell.name || "").toLowerCase();
        const incantation = (
          spell.spell ||
          spell.originalName ||
          ""
        ).toLowerCase();
        return name.includes(query) || incantation.includes(query);
      });

      if (filteredSpells.length === 0) {
        this.spellsGrid.innerHTML =
          "<p style='color: var(--text-muted); grid-column: 1/-1;'>Nenhum feitiço encontrado pelos nossos pergaminhos.</p>";
        return;
      }
      this.renderSpells(filteredSpells);
    });
  }

  async init() {
    try {
      const loadingToast = this.toast.show("Invocando feitiços...", "loading");
      this.data = await this.fetchSpells();

      this.toast.remove(loadingToast); // Remove a animação de loading assim que os dados chegam
      this.toast.show("Feitiços carregados com sucesso!", "success");

      this.renderSpells();
      this.searchSpells();
    } catch (error) {
      console.error("Erro ao inicializar a página de feitiços:", error);
      this.toast.show("Falha mágica ao carregar feitiços.", "error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const spellPage = new SpellPage();
  spellPage.init();
});
