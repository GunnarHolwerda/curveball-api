import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';
import { generatePhone } from '../../../src/util/generate-phone';

fdescribe('POST /users/{userId}/friends/{friendUserId}:recommended', () => {
    let currentUser: IUserResponse;
    let userResources: UserResources;
    let otherUserPhones: Array<string>;

    beforeEach(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        currentUser = response.user;
        userResources = new UserResources(response.token);
        otherUserPhones = [generatePhone(), generatePhone(), generatePhone(), generatePhone(), generatePhone()];
        for (const phone of otherUserPhones) {
            await userResources.createUser(phone);
        }
    });

    it('should return recommended friends', async () => {
        const { recommendations } = await userResources.getFriendRecommendations(currentUser.userId, otherUserPhones);
        expect(recommendations.length).toBe(otherUserPhones.length, 'Was not recommended other users');
    });
});
