
import * as hapi from 'hapi';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendFactory } from '../../../../models/factories/friend-factory';
import { Friend, IFriendResponse } from '../../../../models/entities/friend';

const resolveResponses = async (friends: Array<Friend>): Promise<Array<IFriendResponse>> => {
    const friendPromises = friends.map((f) => {
        return f.toResponseObject();
    });

    return await Promise.all(friendPromises);
};

export async function getUserFriends(event: hapi.Request): Promise<object> {
    const userClaims = event.auth.credentials as UserJwtClaims;

    const [friends, outgoingRequests, incomingRequests] = await Promise.all([
        FriendFactory.loadAll(userClaims.userId),
        FriendFactory.loadOutgoingRequests(userClaims.userId),
        FriendFactory.loadIncomingRequests(userClaims.userId)
    ]);

    const [friendResponses, outgoingResponses, incomingResponses] = await Promise.all([
        resolveResponses(friends),
        resolveResponses(outgoingRequests),
        resolveResponses(incomingRequests)
    ]);

    return {
        requests: {
            outgoing: outgoingResponses,
            incoming: incomingResponses,
        },
        friends: friendResponses
    };
}


