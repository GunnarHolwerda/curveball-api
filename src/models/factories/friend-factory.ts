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
        const result = await sq.from({ 'outgoing': FRIEND_TABLE_NAME })
            .join({ 'incoming': FRIEND_TABLE_NAME }).on`incoming.friend_user_id = outgoing.account_user_id`
            .where`outgoing.account_user_id = ${accountUserId}`
            .and`outgoing.deleted = false`
            .return({
                account_user_id: 'outgoing.account_user_id',
                id: 'outgoing.id',
                deleted: 'outgoing.deleted',
                created: 'outgoing.created',
                friend_user_id: 'outgoing.friend_user_id'
            });

        return result.map(r => new Friend(r as IFriend));
    }

    public static async loadIncomingRequests(accountUserId: string): Promise<Array<Friend>> {
        const sq = Database.instance.sq;
        const result = await sq.from({ 'outgoing': FRIEND_TABLE_NAME })
            .right.join({ 'incoming': FRIEND_TABLE_NAME }).on`incoming.friend_user_id = outgoing.account_user_id`
            .where`incoming.friend_user_id = ${accountUserId}`
            .and`incoming.deleted = false`
            .and`outgoing.friend_user_id IS NULL`
            .return({
                account_user_id: 'incoming.friend_user_id',
                id: 'incoming.id',
                deleted: 'incoming.deleted',
                created: 'incoming.created',
                friend_user_id: 'incoming.account_user_id'
            });

        return result.map(r => new Friend(r as IFriend));
    }

    public static async loadOutgoingRequests(accountUserId: string): Promise<Array<Friend>> {
        const sq = Database.instance.sq;
        const result = await sq.from({ 'outgoing': FRIEND_TABLE_NAME })
            .left.join({ 'incoming': FRIEND_TABLE_NAME }).on`incoming.friend_user_id = outgoing.account_user_id`
            .where`outgoing.account_user_id = ${accountUserId}`
            .and`outgoing.deleted = false`
            .and`incoming.friend_user_id IS NULL`
            .return({
                account_user_id: 'outgoing.account_user_id',
                id: 'outgoing.id',
                deleted: 'outgoing.deleted',
                created: 'outgoing.created',
                friend_user_id: 'outgoing.friend_user_id'
            });

        return result.map(r => new Friend(r as IFriend));
    }
}