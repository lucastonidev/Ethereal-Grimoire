import express from "express";
import {
  getAllCharacters,
  getByNameCharacters,
} from "../controllers/api/character.controller.js";
import { getSpells } from "../controllers/api/spell.controller.js";
import { getAllQuiz, getQuizById } from "../controllers/api/quiz.controller.js";
import { getAllHouses, getHouseById } from "../controllers/api/houses.controller.js";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({ success: true, message: "API do Ethereal Grimoire online!" });
});

/* Characters from the Harry Potter universe */
router.get("/characters", getAllCharacters);
router.get("/characters/:id", getByNameCharacters);

router.get("/spells", getSpells);

router.get("/houses", getAllHouses);
router.get("/houses/:id", getHouseById);

router.get("/quizzes", getAllQuiz);
router.get("/quizzes/:id", getQuizById);

export { router as apiRoutes };
