import { expectHttpError } from '../../resources/test-helpers';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';

describe('GET /users/{userId}/lives', () => {
    let referrer: IUserResponse;
    let referred: IUserResponse;
    let userResources: UserResources;

    beforeAll(async () => {
        userResources = new UserResources();
        const { user, token: referrerToken } = await userResources.getNewUser();
        referrer = user;

        referred = (await userResources.getNewUser(referrer.username)).user;
        userResources.token = referrerToken;
    });

    it('should retrieve lives for a user who has them', async () => {
        const lives = await userResources.getLives(referrer.userId);
        expect(lives, 'Did not retrieve a life for a user that has 1 life').toBe(1);
    });

    it('should return 403 if requesting a users lives other than your own', async () => {
        await expectHttpError(userResources.getLives(referred.userId), 403);
    });
});
