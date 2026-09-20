class ApiClient {
  constructor() {
    this.language = "pt";
    this.baseUrl =
      "https://raw.githubusercontent.com/lucastonidev/ethereal-data/refs/heads/main/data";
  }

  setLanguage(language) {
    this.language = language;
  }

  async getCharacterByName(name, lang = this.language) {
    const characters = await this.getAllCharacters(lang);
    return characters.find((character) => character.name === name);
  }

  async getAllCharacters(lang = this.language) {
    const response = await fetch(
      `${this.baseUrl}/${lang}/characters.${lang}.json`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getAllSpells(lang = this.language) {
    const response = await fetch(`${this.baseUrl}/${lang}/spells.${lang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getAllQuizzes(lang = this.language) {
    const quizzes = [
      `${this.baseUrl}/${lang}/quizzes/dark-arts.${lang}.json`,
      `${this.baseUrl}/${lang}/quizzes/ebook.${lang}.json`,
      `${this.baseUrl}/${lang}/quizzes/owls.${lang}.json`,
      `${this.baseUrl}/${lang}/quizzes/personality.${lang}.json`,
      `${this.baseUrl}/${lang}/quizzes/sorting-hat.${lang}.json`,
    ];

    const quizData = await Promise.all(
      quizzes.map(async (quizUrl) => {
        const response = await fetch(quizUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }),
    );

    return quizData;
  }

  async getQuizById(id, lang = this.language) {
    const quizzes = await this.getAllQuizzes(lang);
    const quiz = quizzes.find((quiz) => quiz.metadata.id === id);
    if (!quiz) {
      throw new Error(`Quiz with ID ${id} not found.`);
    }
    return quiz;
  }
}

export const apiClient = new ApiClient();
