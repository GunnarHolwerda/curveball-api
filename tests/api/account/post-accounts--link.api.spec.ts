import { AccountResources, AccountLoginResponse } from '../../resources/account-resources';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import * as uuid from 'uuid/v4';

describe('POST /accounts:link', () => {
    let accountResources: AccountResources;
    let userResources: UserResources;
    let account: AccountLoginResponse;
    let user: UserTokenResponse;

    beforeEach(async () => {
        accountResources = new AccountResources();
        userResources = new UserResources();
        account = await accountResources.createAndLoginToAccount();
        user = await userResources.getNewUser();
        accountResources.token = account.token;
    });

    it('should link an account to a user account', async () => {
        const result = await accountResources.linkAccountToUser(account.token, user.token);
        expect(result.user.userId).toEqual(user.user.userId);
    });

    it('should return a 500 if supplied accountToken is invalid', async () => {
        await expectHttpError(accountResources.linkAccountToUser(uuid(), user.token), 500);
    });

    it('should return 500 if supplied userToken is invalid', async () => {
        await expectHttpError(accountResources.linkAccountToUser(account.token, uuid()), 500);
    });
});