import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';

describe('GET /users/{userId}/friends', () => {
    let currentUserResponse: UserTokenResponse;
    let currentUserResources: UserResources;
    let friendUserResources: UserResources;
    let friendUserResponse: UserTokenResponse;

    let friendUser: IUserResponse;
    let currentUser: IUserResponse;

    beforeEach(async () => {
        currentUserResources = new UserResources();
        currentUserResponse = await currentUserResources.getNewUser();
        currentUserResources = new UserResources(currentUserResponse.token);
        currentUser = currentUserResponse.user;
        friendUserResponse = await currentUserResources.getNewUser();
        friendUserResources = new UserResources(friendUserResponse.token);
        friendUser = friendUserResponse.user;
        await currentUserResources.addFriend(currentUser.userId, friendUser.userId);
    });

    it('should return user as outgoing request if friend user has not requested user', async () => {
        const { requests } = await currentUserResources.getFriends(currentUser.userId);
        const outgoingRequest = requests.outgoing.find(f => f.friend.userId === friendUser.userId);
        await expect(outgoingRequest).toBeDefined('Friend request was not added to outgoing requests');
    });

    it('should return user as incoming request if another user requested the current user', async () => {
        const { requests } = await friendUserResources.getFriends(friendUser.userId);
        const incomingRequest = requests.incoming.find(f => f.friend.userId === currentUser.userId);
        await expect(incomingRequest).toBeDefined('Friend request was not added to incoming requests');
    });

    it('should return user as friend if both users have added each other', async () => {
        await friendUserResources.addFriend(friendUser.userId, currentUser.userId);
        const { friends } = await currentUserResources.getFriends(currentUser.userId);
        const friend = friends.find(f => f.friend.userId === friendUser.userId);
        await expect(friend).toBeDefined('Friend request was not added to outgoing requests');
    });

    it('should not return deleted friends', async () => {
        await currentUserResources.removeFriend(currentUser.userId, friendUser.userId);
        const { friends } = await currentUserResources.getFriends(currentUser.userId);
        const friend = friends.find(f => f.friend.userId === friendUser.userId);
        await expect(friend).toBeUndefined('Found a deleted friend');
    });
});
