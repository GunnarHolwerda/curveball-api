
import * as hapi from 'hapi';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendFactory } from '../../../../models/factories/friend-factory';

export async function getUserFriends(event: hapi.Request): Promise<object> {
    const userClaims = event.auth.credentials as UserJwtClaims;
    const allFriends = await FriendFactory.loadAll(userClaims.userId);

    const friendPromises = allFriends.map((f) => {
        return f.toResponseObject();
    });

    const friendResponses = await Promise.all(friendPromises);

    return {
        friends: friendResponses
    };
}


