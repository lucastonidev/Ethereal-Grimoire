import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/index", { title: "Início | Felix Felicis" });
});

router.get("/houses", (req, res) => {
  res.render("pages/houses", {
    title: "Casas de Hogwarts | Felix Felicis",
  });
});

router.get("/spells", (req, res) => {
  res.render("pages/spells", {
    title: "Feitiços e Encantamentos | Felix Felicis",
  });
});

router.get("/characters", (req, res) => {
  res.render("pages/characters", { title: "Personagens | Felix Felicis" });
});

router.get("/quiz", (req, res) => {
  res.render("pages/quiz-hub", { title: "Quiz Hub | Felix Felicis" });
});

router.get("/quiz/:slug", (req, res) => {
  res.render("pages/quiz", {
    title: "Quiz | Felix Felicis",
    slug: req.params.slug,
  });
});

export { router as viewRoutes }; 