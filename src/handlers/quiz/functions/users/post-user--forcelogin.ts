import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { UserFactory } from '../../models/factories/user-factory';

export const postUserForceLoginSchema = Joi.object().keys({
    phone: Joi.string().required()
}).unknown(false);

export async function postUserForceLogin(event: hapi.Request): Promise<object> {
    const { phone } = event.payload as { phone: string };
    const user = await UserFactory.loadByPhone(phone);

    if (!user) {
        throw Boom.notFound('User does not exist');
    }

    return {
        user: user.toResponseObject(),
        token: user.getJWTToken()
    };
}
