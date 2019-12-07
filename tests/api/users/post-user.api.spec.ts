
import { UserResources } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { generatePhone } from '../../../src/util/generate-phone';

describe('POST /users', () => {
    let userResources: UserResources;
    beforeAll(async () => {
        userResources = new UserResources();
    });

    it('should return userId', async () => {
        const response = await userResources.createUser();
        expect(response.userId, 'Login did not return token').toBeTruthy();
    });

    it('should return a userId if the user for a phone already exists', async () => {
        const phone = generatePhone();
        const firstUser = await userResources.createUser(phone);
        const sameUser = await userResources.createUser(phone);
        expect(firstUser.userId, 'Did not return same user for same phone number').toBe(sameUser.userId);
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
        const phone = generatePhone();
        const { userId } = await userResources.createUser(phone);
        expect((await userResources.createUser(phone)).userId).toBe(userId);
    });

    describe('Referrals', () => {
        it('should create a life for a user if referred validly', async () => {
            const referrer = await userResources.getNewUser();
            await userResources.createUser(generatePhone(), referrer.user.username);
            userResources.token = referrer.token;

            const lives = await userResources.getLives(referrer.user.userId);
            expect(lives, 'Referrer did not receive one life for referring').toBe(1);
        });

        it('should return 400 if providing a bad referral code', async () => {
            await expectHttpError(userResources.createUser(generatePhone(), 'bad'), 400, 'Invalid referral code');
        });
    });

    describe('Friend Invites', () => {
        it('should create incoming friend requests for all outstanding invites', async () => {
            const phoneNumber = generatePhone();
            const invitingUsers = await Promise.all([userResources.getNewUser(), userResources.getNewUser(), userResources.getNewUser()]);
            for (const newUser of invitingUsers) {
                const newUserResources = new UserResources(newUser.token);
                await newUserResources.invitePhone(newUser.user.userId, phoneNumber);
            }

            const { userId } = await userResources.createUser(phoneNumber);
            const invitedUser = await userResources.verifyUser(userId);
            const invitedUserResources = new UserResources(invitedUser.token);
            const { requests } = await invitedUserResources.getFriends(invitedUser.user.userId);
            expect(requests.incoming.map(i => i.friend.userId).sort(), 'Did not create incoming friend request for all invites')
                .toEqual(invitingUsers.map(u => u.user.userId).sort());
        });
    });
});
