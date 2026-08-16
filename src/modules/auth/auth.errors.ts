import { ConflictError, UnauthorizedError } from '../../errors/ApiError';

export class UserAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`Un.e utilisateurice existe déjà avec cet email: ${email}`);
        this.code = 'USER_ALREADY_EXISTS';
    }
}

export class InvalidCredentialsError extends UnauthorizedError {
    constructor(){
        super('Email ou mot de passe incorrect.');
        this.code = 'INVALID_CREDENTIALS';
    }
}