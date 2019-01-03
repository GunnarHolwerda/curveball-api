import * as Joi from 'joi';
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendInvite } from '../../../../models/entities/friend-invite';
import { PhoneVerifier } from '../../../../models/phone-verifier';

export const postUserFriendInviteSchema = Joi.object().keys({
    phone: Joi.string().required().description('Phone number for the invited user'),
});

export async function postUserFriendsInvite(event: hapi.Request): Promise<object> {
    const { phone } = event.payload as { phone: string };
    const { userId } = event.auth.credentials as UserJwtClaims;

    const verifiedPhone = PhoneVerifier.getValidPhoneNumber(phone);
    if (verifiedPhone === null) {
        throw Boom.badRequest('Invalid phone number');
    }

    await FriendInvite.create(userId, verifiedPhone);
    return {
        message: 'ok'
    };
}


