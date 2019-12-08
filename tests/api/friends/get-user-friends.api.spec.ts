import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { generatePhone } from '../../../src/util/generate-phone';

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

    describe('Outgoing', () => {
        it('should return user as outgoing request if friend user has not requested user', async () => {
            const { requests } = await currentUserResources.getFriends(currentUser.userId);
            const outgoingRequest = requests.outgoing.find(f => f.friend.userId === friendUser.userId);
            await expect(outgoingRequest, 'Friend request was not added to outgoing requests').toBeDefined();
        });

        it('should only return a user once as an outgoing request despite requesting them multiple times', async () => {
            await currentUserResources.addFriend(currentUser.userId, friendUser.userId);
            const { requests } = await currentUserResources.getFriends(currentUser.userId);
            const outgoingRequests = requests.outgoing.filter(f => f.friend.userId === friendUser.userId);
            await expect(outgoingRequests.length, 'Outgoing friend requests from the same user was returned more than once').toBe(1);
        });
    });

    describe('Incoming', () => {
        it('should return user as incoming request if another user requested the current user', async () => {
            const { requests } = await friendUserResources.getFriends(friendUser.userId);
            const incomingRequest = requests.incoming.find(f => f.friend.userId === currentUser.userId);
            await expect(incomingRequest, 'Friend request was not added to incoming requests').toBeDefined();
        });

        it('should only return a user once as an incoming request despite being requested multiple times', async () => {
            await currentUserResources.addFriend(currentUser.userId, friendUser.userId);
            const { requests } = await friendUserResources.getFriends(friendUser.userId);
            const incomingRequests = requests.incoming.filter(f => f.friend.userId === currentUser.userId);
            await expect(incomingRequests.length, 'Incoming friend requests from the same user was returned more than once').toBe(1);
        });
    });

    describe('Invites', () => {
        let invitePhone: string;
        beforeEach(async () => {
            invitePhone = generatePhone();
            await currentUserResources.invitePhone(currentUser.userId, invitePhone);
        });

        it('should return any invite a user has sent', async () => {
            const { invites } = await currentUserResources.getFriends(currentUser.userId);
            const invite = invites.filter(i => i.invitePhone === invitePhone);
            await expect(invite.length, 'Invite was not properly returned').toBe(1);
        });

        it('should not return accepted invites', async () => {
            const userResources = new UserResources();
            await userResources.createUser(invitePhone);
            const { invites } = await currentUserResources.getFriends(currentUser.userId);
            const invite = invites.filter(i => i.invitePhone === invitePhone);
            await expect(invite.length, 'Invite was not properly excluded').toBe(0);
        });
    });

    describe('Friends', () => {
        it('should return user as friend if both users have added each other', async () => {
            await friendUserResources.addFriend(friendUser.userId, currentUser.userId);
            const { friends } = await currentUserResources.getFriends(currentUser.userId);
            const friend = friends.find(f => f.friend.userId === friendUser.userId);
            await expect(friend, 'Friend request was not added to outgoing requests').toBeDefined();
        });

        it('should only return a user once as a friend despite adding them multiple times', async () => {
            await currentUserResources.addFriend(currentUser.userId, friendUser.userId);
            await friendUserResources.addFriend(friendUser.userId, currentUser.userId);
            const { friends } = await currentUserResources.getFriends(currentUser.userId);
            const addedFriends = friends.filter(f => f.friend.userId === friendUser.userId);
            await expect(addedFriends.length, 'Friend was returned more than once').toBe(1);
        });

        it('should not return deleted friends', async () => {
            await currentUserResources.removeFriend(currentUser.userId, friendUser.userId);
            const { friends } = await currentUserResources.getFriends(currentUser.userId);
            const friend = friends.find(f => f.friend.userId === friendUser.userId);
            await expect(friend, 'Found a deleted friend').toBeUndefined();
        });
    });
});
