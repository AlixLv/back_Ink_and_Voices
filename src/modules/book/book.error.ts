import { ApiError, NotFoundError, ConflictError, BadRequestError } from "../../errors/ApiError";

export class BookNotFoundError extends NotFoundError {
    constructor(){
        super('Aucun livre trouvé.');
        this.code = 'BOOK_NOT_FOUND';
    }
}
export class BookFetchError extends ApiError {
  constructor(message = 'Erreur lors de la récupération des livres') {
    super(500, message, 'BOOK_FETCH_ERROR');
  }
}

export class BookCreateError extends ApiError {
  constructor(message = 'Erreur lors de la création du livre') {
    super(500, message, 'BOOK_CREATE_ERROR');
  }
}

export class BookAlreadyExistsError extends ConflictError {
  constructor() {
    super('Ce livre a déjà été proposé.');
    this.code = 'BOOK_ALREADY_EXISTS';
  }
}

export class InvalidBookReferenceError extends BadRequestError {
  constructor() {
    super('Genre ou thème inconnu.');
    this.code = 'INVALID_BOOK_REFERENCE';
  }
}