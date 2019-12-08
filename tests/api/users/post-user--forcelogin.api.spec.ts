import { expectHttpError } from '../../resources/test-helpers';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { generatePhone } from '../../../src/util/generate-phone';
import { TestToolResources } from '../../resources/test-tool-resources';

describe('POST /users_force_login', () => {
    let userResources: UserResources;
    let testResources: TestToolResources;
    let testUser: UserTokenResponse;
    let testPhone: string;

    beforeAll(async () => {
        testResources = new TestToolResources();
        userResources = new UserResources();
        testPhone = generatePhone();
        const { userId } = await userResources.createUser(testPhone);
        testUser = await userResources.verifyUser(userId);
    });

    it('should return user info and token', async () => {
        const response = await testResources.forceLogin(testPhone);
        expect(response.user, 'Did not return the correct user').toEqual(testUser.user);
        expect(response.token, 'Login did not return token').toBeTruthy();
    });

    it('should return 404 if phone does not exist', async () => {
        await expectHttpError(testResources.forceLogin(generatePhone()), 404);
    });
});
