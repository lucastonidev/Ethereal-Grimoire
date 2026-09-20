export class Toast {
  constructor() {}

  show(message, type = "info", duration = 3000) {
    const toastContainer = document.createElement("div");
    // Adicionamos a classe 'fade-in' e 'visible' do seu global.css para uma entrada suave
    toastContainer.className = `toast toast--${type} fade-in visible`;

    // Configura o ícone e a animação dependendo do tipo
    let iconHtml = "";
    if (type === "loading") {
      // fa-spin faz o ícone girar infinitamente
      iconHtml =
        '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>';
    } else if (type === "success") {
      iconHtml =
        '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>';
    } else if (type === "error") {
      iconHtml =
        '<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>';
    } else {
      iconHtml =
        '<i class="fas fa-info-circle" style="margin-right: 8px;"></i>';
    }

    // Injeta o ícone e a mensagem
    toastContainer.innerHTML = `${iconHtml}<span>${message}</span>`;

    document.body.appendChild(toastContainer);

    // Se for loading, não removemos automaticamente (você remove via código quando carregar)
    if (type !== "loading") {
      setTimeout(() => {
        this.remove(toastContainer);
      }, duration);
    }

    return toastContainer; // Retorna o elemento para controle manual
  }

  // Novo método para remover o toast com animação
  remove(toastElement) {
    if (toastElement && toastElement.parentNode) {
      toastElement.classList.remove("visible");
      // Aguarda o tempo da transição do fade-out antes de remover do DOM
      setTimeout(() => toastElement.remove(), 600);
    }
  }
}
