import { ACCOUNT_TABLE_NAME, Account, IAccount } from '../entities/account';
import { Database } from '../database';

export class AccountFactory {
    public static async load(id: number): Promise<Account | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(ACCOUNT_TABLE_NAME).where`id = ${id}`;
        if (result.length === 0) {
            return null;
        }
        return new Account(result[0] as IAccount);
    }

    public static async loadByEmail(email: string): Promise<Account | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(ACCOUNT_TABLE_NAME).where`email = ${email}`;
        if (result.length === 0) {
            return null;
        }
        return new Account(result[0] as IAccount);
    }

    public static async loadByNetworkName(networkName: string): Promise<Account | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(ACCOUNT_TABLE_NAME).where`network_name = ${networkName}`;
        if (result.length === 0) {
            return null;
        }
        return new Account(result[0] as IAccount);
    }
}