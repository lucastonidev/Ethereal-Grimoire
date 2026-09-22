import { Toast } from "../components/toast.js";
import { App } from "../main.js";
import { QuizProcessor } from "../core/QuizProcessor.js";

class QuizApp {
  constructor() {
    this.quizId = document.getElementById("quiz-app").dataset.quizId;
    this.quizData = null;
    this.processor = null; // Instância do motor de regras
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.toast = new Toast();

    this.categoryScores = {};
    this.correctAnswers = 0;

    this.init();
    new App()._setupMobileMenu();
  }

  async init() {
    document
      .getElementById("btn-start-quiz")
      .addEventListener("click", () => this.startQuiz());
    document
      .getElementById("btn-restart-quiz")
      .addEventListener("click", () => window.location.reload());

    try {
      const loadingToast = this.toast.show(
        "Preparando desafio mágico...",
        "loading",
      );
      const response = await fetch(`/api/v1/quizzes/${this.quizId}`);

      if (!response.ok) throw new Error("Falha ao buscar o quiz");

      this.quizData = await response.json();

      // Inicializa o motor que processa os dados brutos
      this.processor = new QuizProcessor(this.quizData);

      const shuffledQuestions = [...this.quizData.questions].sort(
        () => Math.random() - 0.5,
      );
      this.questions = shuffledQuestions.slice(0, 10);

      this.toast.remove(loadingToast);
      this.populateStartScreen();
    } catch (error) {
      console.error(error);
      this.toast.show("Erro ao carregar o quiz.", "error");
      document.getElementById("quiz-start-desc").innerText =
        "Não foi possível carregar as perguntas.";
    }
  }

  populateStartScreen() {
    if (!this.quizData) return;

    const meta = this.quizData.metadata;
    document.getElementById("quiz-start-title").innerText = meta.title;
    document.getElementById("quiz-start-desc").innerText = meta.description;

    const iconEl = document.getElementById("quiz-icon");
    if (meta.category === "sorting")
      iconEl.className = "fas fa-hat-wizard hat-icon";
    else if (meta.category === "trivia")
      iconEl.className = "fas fa-book-open hat-icon";
    else if (meta.category === "character")
      iconEl.className = "fas fa-user-astronaut hat-icon";
    else iconEl.className = "fas fa-magic hat-icon";

    document.getElementById("total-q-num").innerText = this.questions.length;
    document.getElementById("btn-start-quiz").style.display = "inline-flex";

    // O processador entrega as pontuações iniciais já formatadas
    this.categoryScores = this.processor.initializeScores();
  }

  startQuiz() {
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("quiz-screen").classList.add("active");
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentQuestionIndex];

    document.getElementById("current-q-num").innerText =
      this.currentQuestionIndex + 1;
    const progress = (this.currentQuestionIndex / this.questions.length) * 100;
    document.getElementById("progress-fill").style.width = `${progress}%`;
    document.getElementById("progress-percent").innerText =
      `${Math.round(progress)}%`;

    document.getElementById("question-text").innerText = q.question;

    const optionsArray = q.options || q.answers || q.choices || [];
    const shuffledAnswers = [...optionsArray].sort(() => Math.random() - 0.5);

    const answersGrid = document.getElementById("answers-grid");
    answersGrid.innerHTML = "";

    shuffledAnswers.forEach((ans) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";

      const isStringOption = typeof ans === "string";
      btn.innerText = isStringOption ? ans : ans.text;

      btn.addEventListener("click", () => {
        if (!this.processor.isSortingQuiz) {
          if (
            (isStringOption && ans === q.correctAnswer) ||
            (!isStringOption && ans.isCorrect)
          ) {
            this.correctAnswers++;
          }
        } else {
          if (!isStringOption) {
            if (ans.points && typeof ans.points === "object") {
              for (const [key, pts] of Object.entries(ans.points)) {
                this.categoryScores[key] =
                  (this.categoryScores[key] || 0) + pts;
              }
            } else if (Array.isArray(ans.value)) {
              ans.value.forEach((val) => {
                this.categoryScores[val] = (this.categoryScores[val] || 0) + 1;
              });
            } else {
              const val =
                ans.value ||
                ans.character ||
                ans.resultId ||
                ans.id ||
                ans.house;
              if (val)
                this.categoryScores[val] = (this.categoryScores[val] || 0) + 1;
            }
          }
        }
        this.advanceQuiz();
      });

      answersGrid.appendChild(btn);
    });
  }

  advanceQuiz() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      this.renderQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    document.getElementById("progress-fill").style.width = `100%`;
    document.getElementById("progress-percent").innerText = `100%`;

    setTimeout(() => {
      document.getElementById("quiz-screen").classList.remove("active");
      this.showResult();
    }, 500);
  }

  // Olha como o showResult ficou elegante e legível!
  showResult() {
    const resultScreen = document.getElementById("result-screen");

    // Delega a avaliação dos pontos para a inteligência da classe QuizProcessor
    const finalData = this.processor.getFinalResult(
      this.categoryScores,
      this.correctAnswers,
      this.questions.length,
    );

    // Fica responsável APENAS por injetar os dados no HTML
    document.getElementById("result-subtitle").innerText = finalData.subtitle;
    document.getElementById("result-main-text").innerText = finalData.title;
    document.getElementById("result-desc").innerText = finalData.description;
    document.getElementById("result-icon-container").innerHTML =
      finalData.iconHtml;

    resultScreen.className = finalData.colorClass
      ? `screen active ${finalData.colorClass}`
      : "screen active";
    resultScreen.style.borderColor = "var(--gold)";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new QuizApp();
});
