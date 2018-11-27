import { expectHttpError } from '../resources/test-helpers';
import { Test } from '../resources/user-resources';

describe('POST /users_force_login', () => {
    let userResources: Test.UserResources;
    let testUser: Test.UserTokenResponse;
    let testPhone: string;

    beforeAll(async () => {
        userResources = new Test.UserResources();
        testPhone = Test.generatePhone();
        const { userId } = await userResources.createUser(testPhone);
        testUser = await userResources.verifyUser(userId);
    });

    it('should return user info and token', async () => {
        const response = await userResources.forceLogin(testPhone);
        expect(response.user).toEqual(testUser.user, 'Did not return the correct user');
        expect(response.token).toBeTruthy('Login did not return token');
    });

    it('should return 404 if phone does not exist', async () => {
        await expectHttpError(userResources.forceLogin(Test.generatePhone()), 404);
    });
});
