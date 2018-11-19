import * as jsonwebtoken from 'jsonwebtoken';
import * as hapi from 'hapi';

import { CurveballForbidden } from '../../models/curveball-error';

export function verifyJwt<T>(event: hapi.Request, secret: string): T {
    if (!event.headers || !event.headers.hasOwnProperty('Authorization')) {
        throw new CurveballForbidden();
    }
    const token = event.headers.Authorization.replace(/Bearer /g, '');
    try {
        return jsonwebtoken.verify(token, secret) as any as T;
    } catch {
        throw new CurveballForbidden();
    }
}