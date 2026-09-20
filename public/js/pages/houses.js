import { MaraudersMap } from "../map/MaraudersMap.js";
import { App } from "../main.js";

new App()._setupMobileMenu();

const spellInput = document.getElementById("spell-input");
const spellScreen = document.getElementById("spell-screen");

// Inicializa a classe principal do mapa
// (Certifique-se de que o caminho da imagem está correto no seu projeto)
const mapEngine = new MaraudersMap("mapCanvas", "/img/background_map.jpeg");

spellScreen.remove();
mapEngine.start();

// Configuração do feitiço inicial
spellInput.addEventListener("input", (e) => {
  const val = e.target.value.toLowerCase().trim();
  if (val.includes("juro solenemente") || val.includes("sou dev")) {
    spellScreen.classList.add("revealed");
    spellInput.blur();

    // Dispara o loop de renderização do mapa
    mapEngine.start();
  }
});
