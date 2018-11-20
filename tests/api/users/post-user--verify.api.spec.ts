import * as Randomstring from 'randomstring';

import { expectHttpError } from '../resources/test-helpers';
import { Test } from '../resources/user-resources';
import { DevVerificationCode } from '../../../src/handlers/quiz/models/user';

describe('POST /users/{userId}:verify', () => {
    let userResources: Test.UserResources;
    let userId: string;

    beforeAll(async () => {
        userResources = new Test.UserResources();
    });

    beforeEach(async () => {
        const response = await userResources.createUser();
        userId = response.userId;
    });

    it('should return user and token on success', async () => {
        const verifyResponse = await userResources.verifyUser(userId);
        expect(verifyResponse.user).toBeTruthy('The user was not returned from the verify call');
        expect(verifyResponse.token).toBeTruthy('Verification did not return token');
    });

    it('should return 400 if code is invalid', async () => {
        await expectHttpError(userResources.verifyUser(userId, 'badcode'), 400, 'Invalid verification code');
    });

    it('should return 400 if code is not 7 characters long', async () => {
        await expectHttpError(userResources.verifyUser(userId, 'bad'), 400);
    });

    it('should update username if username is provided', async () => {
        const username = Randomstring.generate(7);
        const verifyResponse = await userResources.verifyUser(userId, DevVerificationCode, username);
        expect(verifyResponse.user.username).toBe(username, 'Username was not updated');
    });

    xit('should be able to verify existing user', async () => {
        // Need to be able to clear the cache from the initial user create to test this
    });
});
