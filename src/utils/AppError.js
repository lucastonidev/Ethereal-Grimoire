export class AppError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    // Identificador para sabermos que foi um erro "esperado" e gerado por nós
    this.isOperational = true;

    // Captura a pilha de rastreio (stack trace) excluindo o construtor desta classe
    Error.captureStackTrace(this, this.constructor);
  }
}
