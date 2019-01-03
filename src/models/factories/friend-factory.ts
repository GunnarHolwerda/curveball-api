import { Friend, FRIEND_TABLE_NAME, IFriend } from '../entities/friend';
import { Database } from '../database';

export class FriendFactory {
    public static async load(accountUserId: string, friendUserId: string, allowDeleted: boolean = false): Promise<Friend | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_TABLE_NAME)
            .where`account_user_id = ${accountUserId}`
            .and`friend_user_id = ${friendUserId}`
            .and`deleted = ${allowDeleted}`;
        if (result.length === 0) {
            return null;
        }
        return new Friend(result[0] as IFriend);
    }

    public static async loadAll(accountUserId: string): Promise<Array<Friend>> {
        const sq = Database.instance.sq;
        const query = sq.from({ 'outgoing': FRIEND_TABLE_NAME })
            .join({ 'incoming': FRIEND_TABLE_NAME }).on`outgoing.friend_user_id = incoming.account_user_id`
            .where`outgoing.account_user_id = ${accountUserId}`
            .and`outgoing.deleted = false`
            .and`incoming.deleted = false`
            .group`outgoing.id, incoming.id`
            .return({
                account_user_id: 'outgoing.account_user_id',
                id: 'outgoing.id',
                deleted: 'outgoing.deleted',
                created: 'outgoing.created',
                friend_user_id: 'outgoing.friend_user_id'
            });
        const result = await query;

        return result.map(r => new Friend(r as IFriend));
    }

    public static async loadIncomingRequests(accountUserId: string): Promise<Array<Friend>> {
        const result = await Database.instance.pool.query(`
            SELECT * FROM friends incoming
            WHERE friend_user_id = $1 AND deleted = FALSE
            AND account_user_id NOT IN (
                SELECT outgoing.friend_user_id FROM friends outgoing
                WHERE outgoing.account_user_id = $2 AND outgoing.deleted = FALSE
            )
        `, [accountUserId, accountUserId]);

        return result.rows.map(r => new Friend({
            ...r,
            friend_user_id: r.account_user_id,
            account_user_id: r.friend_user_id
        } as IFriend));
    }

    public static async loadOutgoingRequests(accountUserId: string): Promise<Array<Friend>> {
        const result = await Database.instance.pool.query(`
            SELECT * FROM friends outgoing
            WHERE account_user_id = $1 AND deleted = FALSE
            AND account_user_id NOT IN (
                SELECT incoming.account_user_id FROM friends incoming
                WHERE incoming.friend_user_id = $2 AND outgoing.deleted = FALSE
            )
        `, [accountUserId, accountUserId]);

        return result.rows.map(r => new Friend(r as IFriend));
    }
}