import * as Joi from 'joi';

import * as hapi from 'hapi';
import { User } from '../../models/user';
import { Life } from '../../models/lives';
import { UserFactory } from '../../models/factories/user-factory';
import { PhoneVerifier } from '../../models/phone-verifier';
import * as Boom from 'boom';

export const postUserSchema = Joi.object().keys({
    referral: Joi.string().optional().description('The username of the referrring user'),
    phone: Joi.string().required()
}).unknown(false);

export async function postUser(event: hapi.Request): Promise<object> {
    const { phone, referral } = event.payload as { phone: string, referral?: string };
    let user: User | null = await UserFactory.loadByPhone(phone);
    if (user === null) {
        user = await User.create(phone);
        if (referral) {
            try {
                const referrer = await UserFactory.loadByUsername(referral);
                if (referrer === null) {
                    throw Boom.badRequest('Invalid referral code');
                }
                await Life.create(referrer.properties.user_id);
            } catch (e) {
                throw Boom.badRequest('Invalid referral code');
            }
        }
    }
    const verifier = new PhoneVerifier(user.properties.phone);
    const response = await verifier.sendCode();
    if (!response.success) {
        console.log('Error from Twilio', response);
        throw Boom.internal('Unable to send verification code');
    }

    return {
        userId: user.properties.user_id
    };
}


