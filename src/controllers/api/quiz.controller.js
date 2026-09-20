import { apiClient } from "../../services/api/api.client.js";
import { AppError } from "../../utils/AppError.js";

export const getAllQuiz = async (req, res, next) => {
  try {
    const quizzes = await apiClient.getAllQuizzes();
    const quizData = quizzes.map((quiz) => ({
      id: quiz.metadata.id,
      title: quiz.metadata.title,
      category: quiz.metadata.category,
      badge: quiz.metadata.badge,
      banner: quiz.metadata.bannerImage,
      description: quiz.metadata.description,
    }));
    res.status(200).json(quizData);
  } catch (error) {
    next(new AppError("Erro ao obter os quizzes.", 500, error.message));
  }
};

// Nova função para buscar um quiz específico pelo ID (slug)
export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Chama o método que já existe no seu apiClient
    const quiz = await apiClient.getQuizById(id);

    if (!quiz) {
      return next(new AppError("Quiz não encontrado.", 404));
    }

    // Retorna o quiz completo (com metadata, questions e results)
    res.status(200).json(quiz);
  } catch (error) {
    // Se o apiClient jogar o erro de "not found", retornamos 404
    if (error.message.includes("not found")) {
      return next(new AppError("Quiz não encontrado nos registros.", 404));
    }
    next(new AppError("Erro ao buscar detalhes do quiz.", 500, error.message));
  }
};
