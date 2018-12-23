import { Friend, FRIEND_TABLE_NAME, IFriend } from '../entities/friend';
import { Database } from '../database';

export class FriendFactory {
    public static async load(accountUserId: string, friendUserId: string): Promise<Friend | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_TABLE_NAME)
            .where`account_user_id = ${accountUserId}`
            .and`friend_user_id = ${friendUserId}`
            .and`deleted = false`;
        if (result.length === 0) {
            return null;
        }
        return new Friend(result[0] as IFriend);
    }

    public static async loadAll(accountUserId: string): Promise<Array<Friend>> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_TABLE_NAME)
            .where`account_user_id = ${accountUserId}`
            .and`deleted = false`;

        return result.map(r => new Friend(r as IFriend));
    }
}