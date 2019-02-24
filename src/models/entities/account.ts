import { Database } from '../database';
import * as bcrypt from 'bcrypt';
import { AccountFactory } from '../factories/account-factory';
import { createAccountJWT } from '../jwt';

export interface IAccount {
    id: number;
    email: string;
    password: string;
    network_name: string;
}

export interface IAccountResponse {
    id: number;
    networkName: string;
}

export const ACCOUNT_TABLE_NAME = 'account';

export class Account {
    public properties: IAccount;

    constructor(private _account: IAccount) {
        this.properties = { ...this._account };
    }

    public static async create(email: string, password: string, networkName: string): Promise<Account> {
        const sq = Database.instance.sq;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await sq.from(ACCOUNT_TABLE_NAME).insert({
            email, password: hashedPassword, network_name: networkName
        }).return`id`;
        return (await AccountFactory.load(result[0].id))!;
    }

    public isCorrectPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.properties.password);
    }

    public generateJwt(): string {
        return createAccountJWT({
            accountId: this.properties.id,
            networkName: this.properties.network_name
        });
    }
}