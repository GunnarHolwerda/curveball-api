import { expectHttpError } from '../resources/test-helpers';
import { UserResources, UserTokenResponse, generatePhone } from '../resources/user-resources';

describe('POST /users_force_login', () => {
    let userResources: UserResources;
    let testUser: UserTokenResponse;
    let testPhone: string;

    beforeAll(async () => {
        userResources = new UserResources();
        testPhone = generatePhone();
        const { userId } = await userResources.createUser(testPhone);
        testUser = await userResources.verifyUser(userId);
    });

    it('should return user info and token', async () => {
        const response = await userResources.forceLogin(testPhone);
        expect(response.user).toEqual(testUser.user, 'Did not return the correct user');
        expect(response.token).toBeTruthy('Login did not return token');
    });

    it('should return 404 if phone does not exist', async () => {
        await expectHttpError(userResources.forceLogin(generatePhone()), 404);
    });
});
