import { AccountResources } from '../../resources/account-resources';
import * as uuid from 'uuid/v4';
import { expectHttpError } from '../../resources/test-helpers';

describe('POST /accounts', () => {
    let accountResources: AccountResources;

    beforeEach(() => {
        accountResources = new AccountResources();
    });

    it('should create a new account', async () => {
        await accountResources.createAccount(`${uuid()}@example.com`);
    });

    describe('Validation', () => {
        it('should return 409 if attempting to create account with email already used', async () => {
            const duplicatedEmail = `${uuid()}@example.com`;
            await accountResources.createAccount(duplicatedEmail);
            await expectHttpError(accountResources.createAccount(duplicatedEmail), 409);
        });

        it('should return 409 if attempting to create account with network name already used', async () => {
            const duplicatedNetworkName = uuid();
            await accountResources.createAccount(`${uuid()}@example.com`, uuid(), duplicatedNetworkName);
            await expectHttpError(accountResources.createAccount(`${uuid()}@example.com`, uuid(), duplicatedNetworkName), 409);
        });

        it('should return 400 if email address is invalid', async () => {
            await expectHttpError(accountResources.createAccount(uuid()), 400);
        });
    });
});