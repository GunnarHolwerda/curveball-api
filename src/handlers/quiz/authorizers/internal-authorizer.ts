import * as jsonwebtoken from 'jsonwebtoken';

import { CurveballLambda } from '../lambda/lambda';
import { CurveballForbidden } from '../models/curveball-error';

export async function internalAuthorizer(event: CurveballLambda.Event): Promise<boolean> {
    if (!event.headers.hasOwnProperty('Authorization')) {
        throw new CurveballForbidden();
    }
    const token = event.headers.Authorization.replace(/Bearer /g, '');
    try {
        jsonwebtoken.verify(token, process.env.INTERNAL_TOKEN_SECRET!);
    } catch (e) {
        console.error(e);
        throw new CurveballForbidden();
    }
    return true;
}