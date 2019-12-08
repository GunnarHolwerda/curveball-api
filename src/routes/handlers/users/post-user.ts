import * as Joi from '@hapi/joi';

import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { User } from '../../../models/entities/user';
import { UserFactory } from '../../../models/factories/user-factory';
import { Powerup } from '../../../models/entities/powerup';
import { PhoneVerifier } from '../../../models/phone-verifier';
import { Analytics } from '../../../models/analytics';
import { AnalyticsEvents } from '../../../types/events';

export const postUserSchema = Joi.object().keys({
    referral: Joi.string().optional().description('The username of the referrring user'),
    phone: Joi.string().required()
}).unknown(false);

export async function postUser(event: hapi.Request): Promise<object> {
    const { phone, referral } = event.payload as { phone: string, referral?: string };
    let user: User | null = null;
    let referrer: User | null = null;
    try {
        user = await UserFactory.loadByPhone(phone);
    } catch (e) {
        throw Boom.badRequest('Invalid phone number');
    }
    if (user === null) {
        const userId = await User.create(phone);
        user = (await UserFactory.load(userId))!;
        await user.convertInvitesToFriendRequests();
        if (referral) {
            try {
                referrer = await UserFactory.loadByUsername(referral);
                if (referrer === null) {
                    throw Boom.badRequest('Invalid referral code');
                }
                await Powerup.create(referrer.properties.user_id);
            } catch (e) {
                throw Boom.badRequest('Invalid referral code');
            }
        }
        Analytics.instance.track(user, AnalyticsEvents.signup, {
            referrer: referrer ? referrer.analyticsProperties() : null
        });
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


