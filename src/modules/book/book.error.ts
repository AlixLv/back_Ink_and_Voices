import { NotFoundError } from "../../errors/ApiError";

export class BookNotFoundError extends NotFoundError {
    constructor(){
        super('Aucun livre trouvé.');
        this.code = 'BOOK_NOT_FOUND';
    }
}