import { apiClient } from "../../services/api/api.client.js";
import { AppError } from "../../utils/AppError.js";

export const getAllCharacters = async (req, res, next) => {
  try {
    const characters = await apiClient.getAllCharacters();
    res.status(200).json(characters["characters"]);
  } catch (error) {
    // Substituímos o erro padrão pela nossa classe customizada
    next(new AppError("Erro ao obter os personagens.", 500, error.message));
  }
};

export const getByNameCharacters = async (req, res, next) => {
  try {
    const { name } = req.params;
    const character = await apiClient.getCharacterByName(name);

    if (!character) {
      // Retorna 404 Not Found de forma muito mais elegante
      return next(
        new AppError("Personagem não encontrado nos registros.", 404),
      );
    }

    res.status(200).json(character);
  } catch (error) {
    next(new AppError("Erro ao buscar detalhes do personagem.", 500, error.message));
  }
};
