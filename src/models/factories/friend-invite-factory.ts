import { Database } from '../database';
import { FriendInvite, FRIEND_INVITE_TABLE_NAME, IFriendInvite } from '../entities/friend-invite';

export class FriendInviteFactory {
    public static async load(userId: string, phone: string): Promise<FriendInvite | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_INVITE_TABLE_NAME)
            .where`invite_phone = ${phone}`
            .and`inviter_user_id = ${userId}`
            .and`deleted = false`;

        if (result.length === 0) {
            return null;
        }

        return new FriendInvite(result[0] as IFriendInvite);
    }

    public static async loadByPhone(phone: string): Promise<Array<FriendInvite>> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_INVITE_TABLE_NAME)
            .where`invite_phone = ${phone}`
            .and`deleted = false`
            .and`accepted = false`;
        return result.map(r => new FriendInvite(r as IFriendInvite));
    }

    public static async loadByInvitingUserId(userId: string): Promise<Array<FriendInvite>> {
        const sq = Database.instance.sq;
        const result = await sq.from(FRIEND_INVITE_TABLE_NAME)
            .where`inviter_user_id = ${userId}`
            .and`deleted = false`
            .and`accepted = false`;
        return result.map(r => new FriendInvite(r as IFriendInvite));
    }
}