import { ApiResources } from './test-resources';
import uuid = require('uuid');

export class AccountResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async createAccount(email: string, password: string = uuid(), networkName: string = uuid()): Promise<void> {
        return this.post<void>(`/accounts`, { email, password, networkName });
    }
}
