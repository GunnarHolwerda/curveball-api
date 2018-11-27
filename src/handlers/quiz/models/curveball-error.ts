import { CurveballLambda } from '../lambda/lambda';

export class CurveballError extends Error {
    public readonly statusCode: number;
    public readonly name: string;

    constructor(message?: string, statusCode?: number) {
        const trueProto = new.target.prototype;
        super(message);
        console.error(`${this.constructor.name}: ${this.message}`);

        // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
        // @ts-ignore
        // Mangle prototype object to get proper instance of error in typescript
        this.__proto__ = trueProto;

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        // You can use any additional properties you want.
        // I'm going to use preferred HTTP status for this error types.
        // `500` is the default value if not specified.
        this.statusCode = statusCode || 500;
    }

    toResponse(): CurveballLambda.Response {
        return {
            statusCode: this.statusCode,
            body: {
                message: this.message
            }
        };
    }
}

export class CurveballBadRequest extends CurveballError {
    constructor(message?: string) {
        super(message || 'Invalid parameters', 400);
    }
}

export class CurveballNotFound extends CurveballError {
    constructor(message?: string) {
        super(message || 'Not found', 404);
    }
}

export class CurveballUnauthorized extends CurveballError {
    constructor(message?: string) {
        super(message || 'Unauthorized', 401);
    }
}

export class CurveballForbidden extends CurveballError {
    constructor(message?: string) {
        super(message || 'Forbidden', 403);
    }
}

export class CurveBallConflict extends CurveballError {
    constructor(message?: string) {
        super(message || 'Conflict', 409);
    }
}
