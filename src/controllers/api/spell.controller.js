import { apiClient } from "../../services/api/api.client.js";
import { AppError } from "../../utils/AppError.js";

export const getSpells = async (req, res, next) => {
  try {
    const spells = await apiClient.getAllSpells();
    res.json(spells["spells"]);
  } catch (error) {
    next(new AppError("Erro ao buscar a lista de feitiços.", 500, error.message));
  }
};
