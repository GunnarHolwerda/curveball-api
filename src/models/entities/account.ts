import { Database } from '../database';
import * as bcrypt from 'bcrypt';
import { AccountFactory } from '../factories/account-factory';
import { createAccountJWT } from '../jwt';
import { Omit } from 'lodash';

export interface IAccount {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    network_id: number;
}

export interface IAccountResponse {
    id: number;
    networkName: string;
}

export const ACCOUNT_TABLE_NAME = 'account';
export const ACCOUNT_LINK_TABLE_NAME = 'account_user_link';

export class Account {
    public properties: IAccount;

    constructor(private _account: IAccount) {
        this.properties = { ...this._account };
    }

    public static async create(properties: Omit<IAccount, 'id'>): Promise<Account> {
        const { password, email, first_name, last_name, network_id } = properties;
        const sq = Database.instance.sq;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await sq.from(ACCOUNT_TABLE_NAME).insert({
            email, password: hashedPassword, first_name, last_name, network_id
        }).return`id`;
        return (await AccountFactory.load(result[0].id))!;
    }

    public isCorrectPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.properties.password);
    }

    public async linkUser(userId: string): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(ACCOUNT_LINK_TABLE_NAME).insert({
            account_id: this._account.id,
            user_id: userId
        });
    }

    public async linkedUserId(): Promise<string | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(ACCOUNT_LINK_TABLE_NAME)
            .where`account_id = ${this._account.id}`
            .return`user_id`;
        return result.length === 0 ? null : result.shift()!.user_id;
    }

    public generateJwt(): string {
        return createAccountJWT({
            accountId: this.properties.id,
            networkId: this.properties.network_id
        });
    }
}