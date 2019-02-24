import { ApiResources } from './test-resources';
import * as uuid from 'uuid/v4';

interface AccountLoginResponse {
    accountId: string;
    networkName: string;
    token: string;
}

export class AccountResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async createAccount(email: string, password: string = uuid(), networkName: string = uuid()): Promise<void> {
        return this.post<void>(`/accounts`, { email, password, networkName });
    }

    public async loginAccount(email: string, password: string): Promise<AccountLoginResponse> {
        return this.post<AccountLoginResponse>(`/accounts:login`, { email, password });
    }
}
