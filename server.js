import dontenv from "dotenv";
dontenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`⚡ Servidor mágico rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
