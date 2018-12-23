
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { Friend } from '../../../../models/entities/friend';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { UserFactory } from '../../../../models/factories/user-factory';

export async function postUserFriends(event: hapi.Request): Promise<object> {
    const { friendUserId } = event.params as { friendUserId: string };
    const userClaims = event.auth.credentials as UserJwtClaims;

    const resolveUser = UserFactory.load(userClaims.userId);
    const resolveFriendToAdd = UserFactory.load(friendUserId);

    const [currentUser, friendToAdd] = await Promise.all([resolveUser, resolveFriendToAdd]);

    if (friendToAdd === null) {
        throw Boom.notFound();
    }

    const friend = await Friend.create(currentUser!, friendToAdd);
    return {
        friend: friend.toResponseObject()
    };
}


