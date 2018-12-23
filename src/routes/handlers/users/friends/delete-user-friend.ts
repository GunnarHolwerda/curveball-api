import * as hapi from 'hapi';
import * as Boom from 'boom';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendFactory } from '../../../../models/factories/friend-factory';

export async function deleteUserFriend(event: hapi.Request): Promise<object> {
    const { friendUserId } = event.params as { friendUserId: string };
    const userClaims = event.auth.credentials as UserJwtClaims;

    const friend = await FriendFactory.load(userClaims.userId, friendUserId);
    if (friend === null) {
        throw Boom.notFound();
    }

    await friend.delete();

    return {
        message: 'ok'
    };
}
