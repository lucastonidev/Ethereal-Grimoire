import { App } from "../main.js";

class QuizHub {
  constructor() {
    this.data = null;
    this.categories = null;
    new App()._setupMobileMenu();
  }

  renderQuizzes() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";

    this.data.forEach((quiz) => {
      const quizCard = document.createElement("article");
      quizCard.className = "quiz-card";
      quizCard.dataset.category = quiz.category;

      quizCard.innerHTML = `
        <div class="quiz-card-img">
          <img src="${quiz.banner}" alt="${quiz.title}" />
          <span class="quiz-badge-type">${quiz.badge}</span>
        </div>
        <div class="quiz-card-content">
          <h3>${quiz.title}</h3>
          <p>${quiz.description}</p>
          <a href="/quiz/${quiz.id}" class="btn btn-start-quiz">
            Iniciar Seleção <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;

      quizContainer.appendChild(quizCard);
    });
  }

  renderCategories() {
    const categoryContainer = document.getElementById("category-container");
    categoryContainer.innerHTML = "";

    this.categories.forEach((category, index) => {
      const categoryButton = document.createElement("button");
      // Define a primeira categoria ("Todos") como ativa por padrão
      categoryButton.className =
        index === 0 ? "filter-btn active" : "filter-btn";
      categoryButton.textContent = category;

      categoryButton.addEventListener("click", (e) => {
        // Remove 'active' de todos os botões e adiciona apenas no clicado
        document
          .querySelectorAll("#category-container .filter-btn")
          .forEach((btn) => {
            btn.classList.remove("active");
          });
        e.target.classList.add("active");

        this.filterQuizzesByCategory(category);
      });
      categoryContainer.appendChild(categoryButton);
    });
  }

  async loadQuizzes() {
    try {
      const response = await fetch("/api/v1/quizzes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      this.renderQuizzes();
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }

  loadCategories() {
    let categories = new Set();
    this.data.forEach((quiz) => {
      categories.add(quiz.category);
    });

    this.categories = ["Todos", ...Array.from(categories)];
    this.renderCategories();
  }

  filterQuizzesByCategory(category) {
    const quizCards = document.querySelectorAll(".quiz-card");
    quizCards.forEach((card) => {
      if (category === "Todos" || card.dataset.category === category) {
        // Mantém a propriedade flex original do card para não quebrar o layout
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  async init() {
    await this.loadQuizzes();
    this.loadCategories();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const quizHub = new QuizHub();
  quizHub.init();
});
