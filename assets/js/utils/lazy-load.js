// Versão modular com configurações flexíveis
class ArrayLoader {
  constructor(array, options = {}) {
    this.array = array;
    this.container = options.container || document.getElementById("container");
    this.button = options.button || document.getElementById("loadMoreBtn");
    this.initialItems = options.initialItems || 21;
    this.itemsPerLoad = options.itemsPerLoad || 10; // Quantidade por clique
    this.currentIndex = 0;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.carregarPrimeirosItens();
    this.button.addEventListener("click", () => this.carregarMais());
  }

  carregarPrimeirosItens() {
    this.carregarItens(this.initialItems);
  }

  carregarItens(quantidade) {
    if (this.isLoading || this.currentIndex >= this.array.length) return;

    this.isLoading = true;
    this.button.disabled = true;
    this.button.textContent = "Carregando...";

    setTimeout(() => {
      const endIndex = Math.min(
        this.currentIndex + quantidade,
        this.array.length
      );

      for (let i = this.currentIndex; i < endIndex; i++) {
        this.criarItem(this.array[i]);
      }

      this.currentIndex = endIndex;
      this.atualizarBotao();
      this.isLoading = false;
    }, 300);
  }

  criarItem(texto) {
    const item = document.createElement("div");
    item.classList.add("spell-card");
    item.innerHTML = `
      <h3>${texto.spell}</h3>
      <p>${texto.use}</p>
    `;
    this.container.appendChild(item);
  }

  atualizarBotao() {
    if (this.currentIndex >= this.array.length) {
      this.button.textContent = "Todos os itens carregados";
      this.button.disabled = true;
    } else {
      this.button.textContent = `Carregar Mais (${
        this.array.length - this.currentIndex
      } restantes)`;
      this.button.disabled = false;
    }
  }

  carregarMais() {
    this.carregarItens(this.itemsPerLoad);
  }
}

export { ArrayLoader };