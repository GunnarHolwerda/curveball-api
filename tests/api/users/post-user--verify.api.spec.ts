import * as Randomstring from 'randomstring';

import { expectHttpError } from '../resources/test-helpers';
import { DevVerificationCode } from '../../../src/models/entities/user';
import { UserResources } from '../resources/user-resources';

describe('POST /users/{userId}:verify', () => {
    let userResources: UserResources;
    let userId: string;

    beforeAll(async () => {
        userResources = new UserResources();
    });

    beforeEach(async () => {
        const response = await userResources.createUser();
        userId = response.userId;
    });

    it('should return user, token, and stats on success', async () => {
        const verifyResponse = await userResources.verifyUser(userId);
        expect(verifyResponse.user).toBeTruthy('The user was not returned from the verify call');
        expect(verifyResponse.stats).toBeTruthy('The stats for the user were not returned');
        expect(verifyResponse.token).toBeTruthy('Verification did not return token');
    });

    it('should return 400 if code is invalid', async () => {
        await expectHttpError(userResources.verifyUser(userId, 'badcode'), 400, 'Invalid verification code');
    });

    it('should return 400 if code is not 7 characters long', async () => {
        await expectHttpError(userResources.verifyUser(userId, 'bad'), 400);
    });

    it('should set username if username is provided', async () => {
        const username = Randomstring.generate(7);
        const verifyResponse = await userResources.verifyUser(userId, DevVerificationCode, { username });
        expect(verifyResponse.user.username).toBe(username, 'Username was not updated');
    });

    it('should set name if name is provided', async () => {
        const name = Randomstring.generate(7);
        const verifyResponse = await userResources.verifyUser(userId, DevVerificationCode, { username: Randomstring.generate(7), name });
        expect(verifyResponse.user.name).toBe(name, 'Name was not updated');
    });

    xit('should be able to verify existing user', async () => {
        // Need to be able to clear the cache from the initial user create to test this
    });
});
