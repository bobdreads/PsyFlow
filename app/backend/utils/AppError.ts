export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Identifica se é um erro operacional (previsível) ou bug de programação
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}