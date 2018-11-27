import { expectHttpError } from '../resources/test-helpers';
import { Test } from '../resources/user-resources';

describe('POST /users', () => {
    let userResources: Test.UserResources;
    beforeAll(async () => {
        userResources = new Test.UserResources();
    });

    it('should return userId', async () => {
        const response = await userResources.createUser();
        expect(response.userId).toBeTruthy('Login did not return token');
    });

    it('should return a userId if the user for a phone already exists', async () => {
        const phone = Test.generatePhone();
        const firstUser = await userResources.createUser(phone);
        const sameUser = await userResources.createUser(phone);
        expect(firstUser.userId).toBe(sameUser.userId, 'Did not return same user for same phone number');
    });

    it('should return 400 if phone number is not supplied', async () => {
        // @ts-ignore:one-line
        await expectHttpError(userResources.rawCreateUser(undefined), 400);
    });

    // Ignored because we generate false phone numbers on local
    xit('should return 400 for invalid phone number', async () => {
        await expectHttpError(userResources.createUser('123-123'), 400, 'Invalid phone number');
    });

    it('should return the same userId when submitting the same phone number', async () => {
        const phone = Test.generatePhone();
        const { userId } = await userResources.createUser(phone);
        expect((await userResources.createUser(phone)).userId).toBe(userId);
    });

    describe('Referrals', () => {
        it('should create a life for a user if referred validly', async () => {
            const referrer = await userResources.getNewUser();
            await userResources.createUser(Test.generatePhone(), referrer.user.username);
            userResources.token = referrer.token;

            const lives = await userResources.getLives(referrer.user.userId);
            expect(lives).toBe(1, 'Referrer did not receive one life for referring');
        });

        it('should return 400 if providing a bad referral code', async () => {
            await expectHttpError(userResources.createUser(Test.generatePhone(), 'bad'), 400, 'Invalid referral code');
        });
    });
});
