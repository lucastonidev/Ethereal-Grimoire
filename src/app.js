import express from "express";
import cors from "cors";
import path from "path";

import { viewRoutes } from "./routes/view.routes.js";
import { apiRoutes } from "./routes/api.routes.js";
// 1. Importe o middleware
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const __dirname = process.cwd();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", viewRoutes);
app.use("/api/v1", apiRoutes);

// Tratamento de Erro 404 (Rota não encontrada)
app.use((req, res, next) => {
  // Se for uma rota de API, enviamos um JSON
  if (req.originalUrl.startsWith("/api")) {
    const error = new Error("Endpoint da API não encontrado.");
    error.statusCode = 404;
    return next(error);
  }
  // Se for uma view normal, renderiza o texto (ou uma página de erro customizada)
  res.status(404).send("Página não encontrada no Ethereal Grimoire.");
});

// 2. Registra o Middleware de Erro Global (Sempre no final!)
app.use(errorHandler);

export default app;
