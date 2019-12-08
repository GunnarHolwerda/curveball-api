import { expectHttpError } from '../../resources/test-helpers';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';
import * as uuid from 'uuid';

describe('DELETE /users/{userId}/friends/{friendUserId}', () => {
    let currentUser: IUserResponse;
    let userResources: UserResources;
    let friendUser: IUserResponse;
    let friendResources: UserResources;

    beforeEach(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        currentUser = response.user;
        userResources = new UserResources(response.token);
        const friendUserResponse = await userResources.getNewUser();
        friendUser = friendUserResponse.user;
        friendResources = new UserResources(friendUserResponse.token);
    });

    it('should remove an outgoing friend request', async () => {
        await userResources.addFriend(currentUser.userId, friendUser.userId);
        await userResources.removeFriend(currentUser.userId, friendUser.userId);
        const { requests } = await userResources.getFriends(currentUser.userId);
        const friend = requests.outgoing.find(f => f.friend.userId === friendUser.userId);
        expect(friend, 'Friend was not marked as deleted').toBeUndefined();
    });

    it('should remove an incoming friend request', async () => {
        await userResources.addFriend(currentUser.userId, friendUser.userId);
        await friendResources.removeFriend(friendUser.userId, currentUser.userId);
        const { requests } = await friendResources.getFriends(friendUser.userId);
        const incomingRequest = requests.incoming.find(f => f.friend.userId === currentUser.userId);
        expect(incomingRequest, 'Incoming friend request was not deleted').toBeUndefined();
    });

    it('should remove a friend from both users if both users are friends', async () => {
        await userResources.addFriend(currentUser.userId, friendUser.userId);
        await friendResources.addFriend(friendUser.userId, currentUser.userId);
        const { friends: currentUserFriends } = await userResources.getFriends(currentUser.userId);
        const { friends: friendUserFriends } = await friendResources.getFriends(friendUser.userId);
        expect(friendUserFriends.length, 'Users are not friends after both requesting each other').toEqual(currentUserFriends.length);
    });

    it('should return 404 if the friend attempting to delete does not exist', async () => {
        await expectHttpError(userResources.removeFriend(currentUser.userId, uuid()), 404);
    });

    it('should return 401 if token not provided', async () => {
        const badResources = new UserResources();
        await expectHttpError(badResources.addFriend(currentUser.userId, friendUser.userId), 401);
    });
});
