// src/errors/ApiError.ts
export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    // super: exécution du constructeur de la class parente Error pour initialiser l'objet en tant qu'Error
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (code !== undefined){
        this.code = code;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
    constructor(message = 'Conflit'){
        super(409, message, 'CONFLIT');
    }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message, 'BAD_REQUEST');
  }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden'){
        super(403, message, 'FORBIDDEN')
    }
}  