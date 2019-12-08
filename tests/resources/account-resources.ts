import { ApiResources } from './api-resources';
import * as uuid from 'uuid/v4';
import { UserTokenResponse } from './user-resources';

export interface AccountLoginResponse {
    accountId: string;
    firstName: string;
    lastName: string;
    network: {
        name: string;
        id: number;
    };
    token: string;
    linkedUser: UserTokenResponse | null;
}

export interface CreateAccountOptions {
    firstName: string;
    lastName: string;
    network: {
        name: string;
    };
}

export class AccountResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async createAccount(email: string, password: string = uuid(), options?: Partial<CreateAccountOptions>): Promise<void> {
        if (options === undefined) {
            options = {
                firstName: uuid(),
                lastName: uuid(),
                network: {
                    name: uuid()
                }
            };
        }

        if (options.firstName === undefined) {
            options.firstName = uuid();
        }
        if (options.lastName === undefined) {
            options.lastName = uuid();
        }
        if (options.network === undefined) {
            options.network = { name: uuid() };
        }
        return this.post<void>(`/accounts`, { email, password, ...options });
    }

    public async loginAccount(email: string, password: string): Promise<AccountLoginResponse> {
        return this.post<AccountLoginResponse>(`/accounts:login`, { email, password });
    }

    public async createAndLoginToAccount(
        email: string = `${uuid()}@example.com`,
        password: string = uuid(),
        networkName: string = uuid()
    ): Promise<AccountLoginResponse> {
        await this.createAccount(email, password, { network: { name: networkName } });
        return this.loginAccount(email, password);
    }

    public async linkAccountToUser(accountToken: string, userToken: string): Promise<UserTokenResponse> {
        return this.post<UserTokenResponse>(`/accounts:link`, { accountToken, userToken });
    }
}
