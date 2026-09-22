export class QuizProcessor {
  constructor(quizData) {
    this.quizData = quizData || {};
    this.metadata = this.quizData.metadata || {};
  }

  // Identifica o tipo do quiz
  get isSortingQuiz() {
    const cat = this.metadata.category;
    return cat === "sorting" || cat === "personality" || cat === "character";
  }

  // Busca a array de resultados seja qual for o nome dela no JSON
  getResultsArray() {
    return (
      this.quizData.results ||
      this.quizData.outcomes ||
      this.quizData.profiles ||
      this.quizData.houses ||
      this.quizData.categories ||
      []
    );
  }

  // Prepara o objeto de pontuações zerado
  initializeScores() {
    const scores = {};
    if (this.isSortingQuiz) {
      this.getResultsArray().forEach((result) => {
        const key =
          result.id ||
          result.value ||
          result.name ||
          result.house ||
          result.character;
        if (key) scores[key] = 0;
      });
    }
    return scores;
  }

  // O motor principal: processa os dados e devolve TUDO mastigado para o DOM
  getFinalResult(categoryScores, correctAnswers, totalQuestions) {
    if (this.isSortingQuiz) {
      return this._processSorting(categoryScores);
    } else {
      return this._processTrivia(correctAnswers, totalQuestions);
    }
  }

  _processSorting(scores) {
    let winningCategory = Object.keys(scores)[0] || null;
    let maxScore = -1;

    for (const cat in scores) {
      if (scores[cat] > maxScore) {
        maxScore = scores[cat];
        winningCategory = cat;
      }
    }

    const target = String(winningCategory).toLowerCase();
    const resultsArray = this.getResultsArray();

    let resultData = resultsArray.find((r) => {
      const possibleKeys = [r.id, r.value, r.name, r.house, r.character];
      return possibleKeys.some(
        (key) => key && String(key).toLowerCase() === target,
      );
    });

    // Se falhar no JSON, tenta o Plano C (Fallback)
    if (!resultData) {
      resultData = this._getFallbackResult(target);
    }

    // Se falhar de vez (Erro Crítico de configuração)
    if (!resultData) {
      return {
        subtitle: "O resultado é...",
        title: "Mistério...",
        description: "As magias falharam ao ler o seu destino hoje.",
        iconHtml:
          '<i class="fas fa-question" style="font-size: 80px; color: var(--gold); line-height: 150px;"></i>',
        colorClass: "",
      };
    }

    // Criação Dinâmica do Estilo da Imagem (Retrato Mágico vs Brasão de Casa)
    let iconHtml = "";
    if (resultData.image) {
      const isCharacterPhoto = resultData.image.includes("characters");
      const imgClass = isCharacterPhoto
        ? "character-portrait"
        : "house-crest";

      iconHtml = `<img src="${resultData.image}" class="${imgClass}" alt="Resultado">`;
    } else {
      iconHtml =
        '<i class="fas fa-magic" style="font-size: 80px; color: var(--gold); line-height: 150px;"></i>';
    }

    return {
      subtitle: "O resultado é...",
      title:
        resultData.title || resultData.name || resultData.house || "Resultado",
      description: resultData.description || resultData.desc || "",
      iconHtml: iconHtml,
      colorClass: resultData.colorClass || "",
    };
  }

  _processTrivia(correctAnswers, total) {
    const percentage = Math.round((correctAnswers / total) * 100);
    let title, descriptionText;

    if (percentage === 100) {
      title = "Excepcional!";
      descriptionText =
        "Você acertou todas as perguntas. Hermione ficaria orgulhosa!";
    } else if (percentage >= 70) {
      title = "Muito Bom!";
      descriptionText = `Você acertou ${correctAnswers} de ${total} perguntas. Um ótimo Excede Expectativas!`;
    } else if (percentage >= 40) {
      title = "Aceitável";
      descriptionText = `Você acertou ${correctAnswers} de ${total}. Ainda há muito o que estudar na biblioteca.`;
    } else {
      title = "Trasgo!";
      descriptionText = `Você acertou apenas ${correctAnswers} de ${total}. É melhor voltar para as aulas do Professor Binns.`;
    }

    return {
      subtitle: `Pontuação: ${percentage}%`,
      title: title,
      description: descriptionText,
      iconHtml:
        '<i class="fas fa-scroll" style="font-size: 80px; color: var(--gold); line-height: 150px;"></i>',
      colorClass: "",
    };
  }

  _getFallbackResult(target) {
    const fallbackResults = {
      // --- CASAS DE HOGWARTS ---
      gryffindor: {
        title: "Grifinória",
        description:
          "Você pertence à Grifinória! A casa dos corajosos e audazes. Seus membros são conhecidos por sua bravura e nobreza.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/houses/gryffindor.png",
        colorClass: "result-gryffindor",
      },
      slytherin: {
        title: "Sonserina",
        description:
          "Você pertence à Sonserina! A casa dos astutos e ambiciosos. A Sonserina valoriza a liderança e a desenvoltura.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/houses/slytherin.png",
        colorClass: "result-slytherin",
      },
      ravenclaw: {
        title: "Corvinal",
        description:
          "Você pertence à Corvinal! A casa dos sábios e criativos. Seus membros priorizam a inteligência e o aprendizado constante.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/houses/ravenclaw.png",
        colorClass: "result-ravenclaw",
      },
      hufflepuff: {
        title: "Lufa-Lufa",
        description:
          "Você pertence à Lufa-Lufa! A casa dos justos e leais. Seus membros são trabalhadores, pacientes e valorizam a amizade verdadeira.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/houses/hufflepuff.png",
        colorClass: "result-hufflepuff",
      },

      // --- PERSONALIDADES (Agora com as fotos originais do seu GitHub) ---
      harry: {
        title: "Harry Potter",
        description:
          "Você é o Menino que Sobreviveu! Corajoso, leal e com um forte instinto de liderança. Você não foge de desafios para proteger quem ama.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/harry_potter.png",
        colorClass: "result-gryffindor",
      },
      hermione: {
        title: "Hermione Granger",
        description:
          "Você é a bruxa mais brilhante da sua idade! Inteligente, lógica e extremamente dedicada, o conhecimento é a sua maior arma.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/hermione_granger.png",
        colorClass: "result-gryffindor",
      },
      ron: {
        title: "Rony Weasley",
        description:
          "Você é Rony Weasley! Um amigo de ouro, com um ótimo senso de humor e capaz de imensa bravura nas horas em que isso mais importa.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/ron_weasley.png",
        colorClass: "result-gryffindor",
      },
      draco: {
        title: "Draco Malfoy",
        description:
          "Você é Draco Malfoy! Ambicioso e focado na autopreservação. Você valoriza o legado e não mede esforços para garantir o próprio sucesso.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/draco_malfoy.png",
        colorClass: "result-slytherin",
      },
      luna: {
        title: "Luna Lovegood",
        description:
          "Você é Luna Lovegood! Excêntrica, compassiva e de mente aberta. Você enxerga a magia do mundo de uma maneira que ninguém mais consegue.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/luna_lovegood.png",
        colorClass: "result-ravenclaw",
      },
      neville: {
        title: "Neville Longbottom",
        description:
          "Você é Neville! Embora às vezes duvide de si mesmo, sua verdadeira força vem à tona nos momentos críticos. A resiliência é sua marca registrada.",
        image:
          "https://raw.githubusercontent.com/lucastonidev/ethereal-data/main/image/characters/neville_longbottom.png",
        colorClass: "result-gryffindor",
      },
    };
    return fallbackResults[target];
  }
}
