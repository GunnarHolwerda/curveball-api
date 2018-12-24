import { expectHttpError } from '../../resources/test-helpers';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';
import * as uuid from 'uuid';

describe('POST /users/{userId}/friends/{friendUserId}', () => {
    let currentUser: IUserResponse;
    let userResources: UserResources;
    let friendUser: IUserResponse;

    beforeEach(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        currentUser = response.user;
        userResources = new UserResources(response.token);
        const friendUserResponse = await userResources.getNewUser();
        friendUser = friendUserResponse.user;
    });

    it('should add an outgoing friend request', async () => {
        await userResources.addFriend(currentUser.userId, friendUser.userId);
        const { requests } = await userResources.getFriends(currentUser.userId);
        const outgoingFriendRequest = requests.outgoing.find(f => f.friend.userId === friendUser.userId);
        await expect(outgoingFriendRequest).toBeDefined('Unable to find added friend in friend response');
    });

    it('should return 404 if the friend attempting to add does not exist', async () => {
        await expectHttpError(userResources.addFriend(currentUser.userId, uuid()), 404);
    });

    it('should return 401 if token not provided', async () => {
        const badResources = new UserResources();
        await expectHttpError(badResources.addFriend(currentUser.userId, friendUser.userId), 401);
    });
});
