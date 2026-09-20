export const errorHandler = (err, req, res, next) => {
  // Pega o status code do nosso AppError ou define 500 (Internal Server Error)
  let statusCode = err.statusCode || 500;
  let message = err.message || "Erro interno do servidor mágico.";

  // Se o erro não for operacional (ex: erro de sintaxe, variável indefinida, etc)
  if (!err.isOperational) {
    console.error(`💥 [ERRO CRÍTICO]`, err);
    // Em produção, escondemos o erro real para segurança
    if (process.env.NODE_ENV === "production") {
      message = "Algo deu muito errado no Grimoire.";
      statusCode = 500;
    }
  } else {
    // Loga os erros operacionais (nossos AppErrors) de forma mais limpa
    console.error(`[API Error] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
};
