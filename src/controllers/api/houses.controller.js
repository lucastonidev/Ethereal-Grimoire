import { apiClient } from "../../services/api/api.client.js";
import { AppError } from "../../utils/AppError.js";

export const getAllHouses = async (req, res, next) => {
  try {
    const houses = await apiClient.getAllHouses();
    res.json(houses["houses"]);
  } catch (error) {
    next(new AppError("Erro ao buscar a lista de casas.", 500, error.message));
  }
};

export const getHouseById = async (req, res, next) => {
  try {
    const house = await apiClient.getHouseById(req.params.id);
    res.json(house);
  } catch (error) {
    next(new AppError("Erro ao buscar a casa.", 500, error.message));
  }
};
