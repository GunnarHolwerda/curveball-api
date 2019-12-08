
import * as hapi from '@hapi/hapi';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FriendFactory } from '../../../../models/factories/friend-factory';
import { Friend, IFriendResponse } from '../../../../models/entities/friend';
import { FriendInviteFactory } from '../../../../models/factories/friend-invite-factory';

const resolveResponses = async (friends: Array<Friend>): Promise<Array<IFriendResponse>> => {
    const friendPromises = friends.map((f) => {
        return f.toResponseObject();
    });

    return await Promise.all(friendPromises);
};

export async function getUserFriends(event: hapi.Request): Promise<object> {
    const userClaims = event.auth.credentials as UserJwtClaims;
    const { userId } = userClaims;

    const [friends, outgoingRequests, incomingRequests, invites] = await Promise.all([
        FriendFactory.loadAll(userId),
        FriendFactory.loadOutgoingRequests(userId),
        FriendFactory.loadIncomingRequests(userId),
        FriendInviteFactory.loadByInvitingUserId(userId)
    ]);

    const [friendResponses, outgoingResponses, incomingResponses, inviteResponses] = await Promise.all([
        resolveResponses(friends),
        resolveResponses(outgoingRequests),
        resolveResponses(incomingRequests),
        Promise.all(invites.map(i => i.toResponseObject()))
    ]);

    return {
        requests: {
            outgoing: outgoingResponses,
            incoming: incomingResponses,
        },
        invites: inviteResponses,
        friends: friendResponses
    };
}


