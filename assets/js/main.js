import { slidebarCharacter } from "./utils/slidebar.js";
import { ArrayLoader } from "./utils/lazy-load.js";
import { UI } from "./utils/ui.js";

class main {
  constructor() {
    this.baseUrl = "https://potterapi-fedeperin.vercel.app/pt/";
    this.init();
  }

  init() {
    this.fetchMainCharacters();
    this.fetchSpells();
  }

  async fetchMainCharacters() {
    const ui = new UI();
    const characters = [
      "harry",
      "hermione",
      "ron",
      "dumbledore",
      "snape",
      "voldemort",
      "sirius",
      "lupin",
    ];

    try {
      const promises = characters.map((character) =>
        fetch(`${this.baseUrl}characters?search=${character}`).then(
          (response) => {
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return response.json();
          }
        )
      );

      const allData = await Promise.all(promises);

      allData.forEach((data) => {
        ui.mainCharacters(data);
      });

      slidebarCharacter();
    } catch (error) {
      console.error("Erro ao buscar personagens:", error);
    }
  }

  async fetchSpells() {
    try {
      const response = await fetch(`${this.baseUrl}spells`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      const loader = new ArrayLoader(data, {
        container: document.querySelector(".spells-grid"),
        button: document.getElementById("loadMoreBtn"),
        initialItems: 21,
        itemsPerLoad: 10,
      });

    } catch (error) {
      console.error("Erro ao buscar feitiços:", error);
    }
  }

}

new main();



// Navegação suave
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// Menu mobile
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
