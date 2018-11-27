import { CurveballBadRequest } from '../models/curveball-error';
import * as Joi from 'joi';

export function validatePayload(stringPayload: string | undefined, schema: Joi.ObjectSchema, options?: Joi.ValidationOptions): any {
    const defaultOptions: Joi.ValidationOptions = { stripUnknown: true };
    const payload = JSON.parse(stringPayload || JSON.stringify({}));
    const result = Joi.validate(payload, schema.options({ ...defaultOptions, ...options }));
    if (result.error) {
        const parsedMessage = result.error.message.match(/\[(.*)\]/);

        let errorMessage: string | undefined;
        if (parsedMessage !== null) {
            errorMessage = parsedMessage![1];
        }
        throw new CurveballBadRequest(errorMessage);
    }
    return result.value;
}
