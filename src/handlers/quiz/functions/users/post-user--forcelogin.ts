import * as Joi from 'joi';

import * as hapi from 'hapi';
import { UserFactory } from '../../models/factories/user-factory';
import { CurveballForbidden } from '../../models/curveball-error';

export const postUserForceLoginSchema = Joi.object().keys({
    phone: Joi.string().regex(/\d{3}-\d{3}-\d{4}/).required()
}).unknown(false);

export async function postUserForceLogin(event: hapi.Request): Promise<object> {
    const { phone } = event.payload as { phone: string };
    const user = await UserFactory.loadByPhone(phone);

    if (!user) {
        throw new CurveballForbidden('User does not exist');
    }

    return {
        user: user.toResponseObject(),
        token: user.getJWTToken()
    };
}
