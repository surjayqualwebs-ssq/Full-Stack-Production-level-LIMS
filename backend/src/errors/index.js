import ApiError from './ApiError.js';

export class AuthorizationError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

export class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}

export { ApiError };
