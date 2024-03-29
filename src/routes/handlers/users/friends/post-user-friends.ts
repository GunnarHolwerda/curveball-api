
import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { Friend } from '../../../../models/entities/friend';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { UserFactory } from '../../../../models/factories/user-factory';
import { FriendFactory } from '../../../../models/factories/friend-factory';

export async function postUserFriends(event: hapi.Request): Promise<object> {
    const { friendUserId } = event.params as { friendUserId: string };
    const userClaims = event.auth.credentials as UserJwtClaims;

    const friendToAdd = await UserFactory.load(friendUserId);

    if (friendToAdd === null) {
        throw Boom.notFound();
    }

    let friend = await FriendFactory.load(userClaims.userId!, friendUserId);
    if (friend === null) {
        await Friend.create(userClaims.userId!, friendUserId);
    }
    friend = (await FriendFactory.load(userClaims.userId!, friendUserId))!;

    return {
        friend: await friend.toResponseObject()
    };
}


