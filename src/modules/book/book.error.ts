import { ApiError, NotFoundError } from "../../errors/ApiError";

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