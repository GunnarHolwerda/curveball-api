import { AccountResources } from '../../resources/account-resources';
import * as uuid from 'uuid/v4';
import { expectHttpError } from '../../resources/test-helpers';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';

describe('POST /accounts:login', () => {
    let accountResources: AccountResources;
    let password: string;
    let email: string;

    beforeEach(async () => {
        accountResources = new AccountResources();
        password = uuid();
        email = `${uuid()}@example.com`;
        await accountResources.createAccount(email, password);
    });

    it('should login to acount', async () => {
        const account = await accountResources.loginAccount(email, password);
        expect(account.token).toBeTruthy();
    });

    describe('Linked account', () => {
        let user: UserTokenResponse;

        beforeEach(async () => {
            const userResources = new UserResources();
            user = await userResources.getNewUser();
            const { token } = await accountResources.loginAccount(email, password);
            accountResources.token = token;
            await accountResources.linkAccountToUser(token, user.token);
            accountResources.token = undefined;
        });

        it('should return a linkedUser if the account has been linked to a user account', async () => {
            const response = await accountResources.loginAccount(email, password);
            expect(response.linkedUser, 'The linked user was not returned on logging in').toBeDefined();
            expect(response.linkedUser!.user.userId, 'Did not link the proper user to the account').toEqual(user.user.userId);
        });
    });

    describe('Validation', () => {
        it('should return 404 if logging into account with email that does not exist', async () => {
            await expectHttpError(accountResources.loginAccount(`${uuid()}@example.com`, uuid()), 404);
        });

        it('should return 403 if invalid password is supplied', async () => {
            await expectHttpError(accountResources.loginAccount(email, uuid()), 403);
        });
    });
});