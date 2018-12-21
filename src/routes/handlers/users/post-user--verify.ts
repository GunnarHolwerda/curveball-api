import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { UserFactory } from '../../../models/factories/user-factory';
import { PhoneVerifier } from '../../../models/phone-verifier';
import { Analytics } from '../../../models/analytics';
import { AnalyticsEvents } from '../../../types/events';

export const postUserVerifySchema = Joi.object().keys({
    code: Joi.string().min(4).required().description('The verification code for the user'),
    // TODO: Prevent whitespace
    username: Joi.string().min(1).max(15).optional().description('Username for the user'),
    name: Joi.string().min(1).optional().description('Name of the user')
});

export async function postUserVerify(event: hapi.Request): Promise<object> {
    const { code, username, name } = event.payload as { code: string, username?: string, name?: string };
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

    if (name) {
        user.properties.name = name;
        await user.save();
    }

    Analytics.instance.track(user, AnalyticsEvents.login);

    return {
        user: user.toResponseObject(),
        stats: await user.stats(),
        token: user.getJWTToken()
    };
}


