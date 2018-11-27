import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { UserFactory } from '../../models/factories/user-factory';
import { PhoneVerifier } from '../../models/phone-verifier';

export const postUserVerifySchema = Joi.object().keys({
    code: Joi.string().min(4).max(7).required().description('The verification code for the user'),
    username: Joi.string().min(1).max(15).optional().description('Username for the user')
});

export async function postUserVerify(event: hapi.Request): Promise<object> {
    const { code, username } = event.payload as { code: string, username: string };
    const { userId } = event.params;
    const user = await UserFactory.load(userId);
    if (user === null) {
        throw Boom.notFound();
    }
    const verifier = new PhoneVerifier(user.properties.phone);
    const response = await verifier.verifyCode(code);

    if (!response.success) {
        throw Boom.badRequest('Invalid verification code');
    }

    if (username) {
        user.properties.username = username;
        await user.save();
    }

    return {
        user: user.toResponseObject(),
        token: user.getJWTToken()
    };
}


