import * as Joi from 'joi';

import * as hapi from 'hapi';
import { User } from '../../models/user';
import { Life } from '../../models/lives';
import { CurveballBadRequest, CurveballError } from '../../models/curveball-error';
import { UserFactory } from '../../models/factories/user-factory';
import { PhoneVerifier } from '../../models/phone-verifier';

export const postUserSchema = Joi.object().keys({
    referral: Joi.string().optional().description('The username of the referrring user'),
    phone: Joi.string().regex(/\d{3}-\d{3}-\d{4}/).required()
}).unknown(false);

export async function postUser(event: hapi.Request): Promise<object> {
    const { phone, referral } = event.payload as { phone: string, referral?: string };
    let user: User;
    try {
        user = await UserFactory.loadByPhone(phone);
    } catch (e) {
        user = await User.create(phone);
        if (referral) {
            try {
                const referrer = await UserFactory.loadByUsername(referral);
                await Life.create({
                    userId: referrer.properties.user_id,
                    referredUserId: referrer.properties.user_id
                });
            } catch (e) {
                throw new CurveballBadRequest('Invalid referral code');
            }
        }
    }
    const verifier = new PhoneVerifier(user.properties.phone);
    const response = await verifier.sendCode();
    if (!response.success) {
        console.log('Error from Twilio', response);
        throw new CurveballError('Unable to send verification code');
    }

    return {
        userId: user.properties.user_id
    };
}


