import * as Joi from 'joi';
import * as hapi from 'hapi';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendInvite } from '../../../../models/entities/friend-invite';

export const postUserFriendInviteSchema = Joi.object().keys({
    phone: Joi.string().required().description('Phone number for the invited user'),
});

export async function postUserFriendsInvite(event: hapi.Request): Promise<object> {
    const { phone } = event.payload as { phone: string };
    const { userId } = event.auth.credentials as UserJwtClaims;

    await FriendInvite.create(userId, phone);
    return {
        message: 'ok'
    };
}


