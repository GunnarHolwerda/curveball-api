import { IUserResponse } from '../../../src/handlers/quiz/models/user';
import { Test } from '../resources/user-resources';
import { expectHttpError } from '../resources/test-helpers';

describe('GET /users/{userId}/lives', () => {
    let referrer: IUserResponse;
    let referred: IUserResponse;
    let userResources: Test.UserResources;

    beforeAll(async () => {
        userResources = new Test.UserResources();
        const { user, token: referrerToken } = await userResources.getNewUser();
        referrer = user;

        referred = (await userResources.getNewUser(referrer.username)).user;
        userResources.token = referrerToken;
    });

    it('should retrieve lives for a user who has them', async () => {
        const lives = await userResources.getLives(referrer.userId);
        expect(lives).toBe(1, 'Did not retrieve a life for a user that has 1 life');
    });

    it('should return 403 if requesting a users lives other than your own', async () => {
        await expectHttpError(userResources.getLives(referred.userId), 403);
    });
});
