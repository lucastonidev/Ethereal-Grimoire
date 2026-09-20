class ArrayLoader {
  constructor(array, options = {}) {
    this.array = array;
    this.container = options.container || document.getElementById("container");
    this.button = options.button || document.getElementById("loadMoreBtn");
    this.initialItems = options.initialItems || 21;
    this.itemsPerLoad = options.itemsPerLoad || 12;
    this.currentIndex = 0;
    this.isLoading = false;
    this.init();
  }

  init() {
    this.loadItems(this.initialItems);
    this.button.addEventListener("click", () => this.loadMore());
  }

  loadItems(count) {
    if (this.isLoading || this.currentIndex >= this.array.length) return;
    this.isLoading = true;
    this.button.disabled = true;
    this.button.innerHTML =
      '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Carregando...';

    setTimeout(() => {
      const end = Math.min(this.currentIndex + count, this.array.length);
      for (let i = this.currentIndex; i < end; i++) {
        this.renderItem(this.array[i]);
      }
      this.currentIndex = end;
      this.updateButton();
      this.isLoading = false;
    }, 300);
  }

  renderItem(item) {
    const card = document.createElement("a");
    // Vamos usar a tag <a> para o card inteiro ser clicável depois, se quiser!
    card.href = `/spells/${item.spell.toLowerCase().replace(/\s+/g, "-")}`;
    card.className = "spell-card";

    card.innerHTML = `
      <div class="spell-card__header">
        <h3 class="spell-card__title">${item.spell || "Feitiço"}</h3>
        <span class="spell-type-badge">${item.type || "Desconhecido"}</span>
      </div>
      <div class="spell-card__body">
        <p class="spell-pronunciation">${item.pronunciation || ""}</p>
        <p class="spell-desc">${item.use || "Sem descrição disponível."}</p>
      </div>
    `;
    this.container.appendChild(card);
  }

  updateButton() {
    const remaining = this.array.length - this.currentIndex;
    if (remaining <= 0) {
      this.button.innerHTML =
        '<i class="fas fa-check" aria-hidden="true"></i> Todos os feitiços carregados';
      this.button.disabled = true;
    } else {
      this.button.innerHTML = `<i class="fas fa-scroll" aria-hidden="true"></i> Carregar Mais (${remaining} restantes)`;
      this.button.disabled = false;
    }
  }

  loadMore() {
    this.loadItems(this.itemsPerLoad);
  }
}

export { ArrayLoader };
