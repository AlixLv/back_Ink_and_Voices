import { ConflictError, NotFoundError } from '../../errors/ApiError.js';

export class UserNotFoundError extends NotFoundError {
    constructor(){
        super('Utilisateurice non trouvé.e.');
        this.code = 'USER_NOT_FOUND';
    }
}

export class ProfileConflictError extends ConflictError {
    constructor(){
        super('Cet email ou ce nom est déjà utilisé.');
        this.code = 'PROFILE_CONFLICT';
    }
}

export class SelfRoleChangeError extends ConflictError {
    constructor(){
        super('Vous ne pouvez pas modifier votre propre rôle.');
        this.code = 'SELF_ROLE_CHANGE';
    }
}
