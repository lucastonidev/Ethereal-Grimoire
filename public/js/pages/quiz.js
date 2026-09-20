import { Toast } from "../components/toast.js";
import { App } from "../main.js";

class QuizApp {
  constructor() {
    this.quizId = document.getElementById("quiz-app").dataset.quizId;
    this.quizData = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.toast = new Toast();

    // Para quizzes tipo 'sorting' ou 'personality' (acumulam pontos por categoria/casa)
    this.categoryScores = {};

    // Para quizzes tipo 'trivia' ou 'owls' (certas vs erradas)
    this.correctAnswers = 0;

    this.init();
    new App()._setupMobileMenu();
  }

  // Identificador automático do tipo de quiz baseado na estrutura do JSON
  get isSortingQuiz() {
    return (
      Array.isArray(this.quizData?.results) && this.quizData.results.length > 0
    );
  }

  async init() {
    // Configura botões de navegação
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

      if (!response.ok) {
        throw new Error("Falha ao buscar o quiz");
      }

      this.quizData = await response.json();

      // Embaralha todas as perguntas e pega apenas as 10 primeiras para a rodada
      const shuffledQuestions = [...this.quizData.questions].sort(
        () => Math.random() - 0.5,
      );
      this.questions = shuffledQuestions.slice(0, 10);

      this.toast.remove(loadingToast);
      this.populateStartScreen();
    } catch (error) {
      console.error(error);
      this.toast.show(
        "Erro ao carregar o quiz. Os trasgos devem ter mexido nos cabos.",
        "error",
      );
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

    if (this.isSortingQuiz) {
      this.quizData.results.forEach((result) => {
        this.categoryScores[result.id] = 0;
      });
    }
  }

  startQuiz() {
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("quiz-screen").classList.add("active");
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentQuestionIndex];

    // Atualiza Barra de Progresso
    document.getElementById("current-q-num").innerText =
      this.currentQuestionIndex + 1;
    const progress = (this.currentQuestionIndex / this.questions.length) * 100;
    document.getElementById("progress-fill").style.width = `${progress}%`;
    document.getElementById("progress-percent").innerText =
      `${Math.round(progress)}%`;

    // Atualiza Texto da Pergunta
    document.getElementById("question-text").innerText = q.question;

    // Embaralha as opções de resposta
    const shuffledAnswers = [...q.options].sort(() => Math.random() - 0.5);

    // Renderiza Botões
    const answersGrid = document.getElementById("answers-grid");
    answersGrid.innerHTML = "";

    shuffledAnswers.forEach((ans) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";

      // Avalia se o item atual do array de opções é apenas o texto (String) ou um Objeto
      const isStringOption = typeof ans === "string";
      btn.innerText = isStringOption ? ans : ans.text;

      btn.addEventListener("click", () => {
        if (!this.isSortingQuiz) {
          // LÓGICA DE TRIVIA (Acertos vs Erros)
          if (isStringOption && ans === q.correctAnswer) {
            this.correctAnswers++;
          } else if (!isStringOption && ans.isCorrect) {
            this.correctAnswers++;
          }
        } else {
          // LÓGICA DE SELEÇÃO (Soma de pontos por categoria)
          if (
            !isStringOption &&
            ans.value &&
            this.categoryScores[ans.value] !== undefined
          ) {
            this.categoryScores[ans.value] += 1;
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

  showResult() {
    const resultScreen = document.getElementById("result-screen");

    if (this.isSortingQuiz) {
      let winningCategory = null;
      let maxScore = -1;

      for (const cat in this.categoryScores) {
        if (this.categoryScores[cat] > maxScore) {
          maxScore = this.categoryScores[cat];
          winningCategory = cat;
        }
      }

      const resultData = this.quizData.results.find(
        (r) => r.id === winningCategory,
      );

      document.getElementById("result-subtitle").innerText = "O resultado é...";
      document.getElementById("result-main-text").innerText = resultData.title;
      document.getElementById("result-desc").innerText = resultData.description;

      if (resultData.image) {
        document.getElementById("result-icon-container").innerHTML =
          `<img src="${resultData.image}" style="width: 100%; height: 100%; object-fit: contain;">`;
      } else {
        document.getElementById("result-icon-container").innerHTML =
          '<i class="fas fa-magic" style="font-size: 80px; color: var(--gold); line-height: 150px;"></i>';
      }

      if (resultData.colorClass) {
        resultScreen.className = `screen active ${resultData.colorClass}`;
      } else {
        resultScreen.className = "screen active";
        resultScreen.style.borderColor = "var(--gold)";
      }
    } else {
      // É UM QUIZ DE TRIVIA
      const total = this.questions.length;
      const percentage = Math.round((this.correctAnswers / total) * 100);

      let title;
      let descriptionText;

      if (percentage === 100) {
        title = "Excepcional!";
        descriptionText =
          "Você acertou todas as perguntas. Hermione ficaria orgulhosa!";
      } else if (percentage >= 70) {
        title = "Muito Bom!";
        descriptionText = `Você acertou ${this.correctAnswers} de ${total} perguntas. Um ótimo Excede Expectativas!`;
      } else if (percentage >= 40) {
        title = "Aceitável";
        descriptionText = `Você acertou ${this.correctAnswers} de ${total}. Ainda há muito o que estudar na biblioteca.`;
      } else {
        title = "Trasgo!";
        descriptionText = `Você acertou apenas ${this.correctAnswers} de ${total}. É melhor voltar para as aulas do Professor Binns.`;
      }

      document.getElementById("result-subtitle").innerText =
        `Pontuação: ${percentage}%`;
      document.getElementById("result-main-text").innerText = title;
      document.getElementById("result-desc").innerText = descriptionText;
      document.getElementById("result-icon-container").innerHTML =
        '<i class="fas fa-scroll" style="font-size: 80px; color: var(--gold); line-height: 150px;"></i>';

      resultScreen.className = "screen active";
      resultScreen.style.borderColor = "var(--gold)";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new QuizApp();
});
