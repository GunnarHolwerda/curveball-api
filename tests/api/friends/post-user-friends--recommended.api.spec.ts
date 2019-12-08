import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';
import { generatePhone } from '../../../src/util/generate-phone';

describe('POST /users/{userId}/friends/{friendUserId}:recommended', () => {
    let currentUser: IUserResponse;
    let userResources: UserResources;
    let otherUserPhones: Array<string>;
    let otherUsers: Array<{ userId: string }>;

    beforeEach(async () => {
        otherUsers = [];
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        currentUser = response.user;
        userResources = new UserResources(response.token);
        otherUserPhones = [generatePhone(), generatePhone(), generatePhone(), generatePhone(), generatePhone()];
        for (const phone of otherUserPhones) {
            const { userId } = await userResources.createUser(phone);
            otherUsers.push({ userId });
        }
    });

    it('should return recommended friends', async () => {
        const { recommendations } = await userResources.getFriendRecommendations(currentUser.userId, otherUserPhones);
        expect(recommendations.length, 'Was not recommended other users').toBe(otherUserPhones.length);
    });

    it('should not return users who are already your friend', async () => {
        const friend = otherUsers[0];
        await userResources.addFriend(currentUser.userId, friend.userId);
        const { recommendations } = await userResources.getFriendRecommendations(currentUser.userId, otherUserPhones);
        expect(recommendations.length, 'Did not exclude added friend').toBe(otherUserPhones.length - 1);
        expect(recommendations.find(f => f.userId === friend.userId), 'Found friend in the recommendations').toBeUndefined();
    });
});
