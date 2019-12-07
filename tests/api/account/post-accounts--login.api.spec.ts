import { AccountResources } from '../../resources/account-resources';
import * as uuid from 'uuid/v4';
import { expectHttpError } from '../../resources/test-helpers';

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

    describe('Validation', () => {
        it('should return 404 if logging into account with email that does not exist', async () => {
            await expectHttpError(accountResources.loginAccount(`${uuid()}@example.com`, uuid()), 404);
        });

        it('should return 403 if invalid password is supplied', async () => {
            await expectHttpError(accountResources.loginAccount(email, uuid()), 403);
        });
    });
});