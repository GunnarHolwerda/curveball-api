import { omit } from '../../util/omit';
import { Database } from '../database';
import { FriendInviteFactory } from '../factories/friend-invite-factory';


export interface IFriendInvite {
    created: Date;
    id: number;
    deleted: boolean;
    accepted: boolean;
    inviter_user_id: string;
    invite_phone: string;
}

export const FRIEND_INVITE_TABLE_NAME = 'friend_invites';

export class FriendInvite {
    public properties: IFriendInvite;

    constructor(private _invite: IFriendInvite) {
        this.properties = { ...this._invite };
    }

    public static async create(inviteUserId: string, phoneNumber: string): Promise<FriendInvite> {
        const sq = Database.instance.sq;
        await sq.from(FRIEND_INVITE_TABLE_NAME).insert({
            inviter_user_id: inviteUserId,
            invite_phone: phoneNumber,
        });
        return (await FriendInviteFactory.load(inviteUserId, phoneNumber))!;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(FRIEND_INVITE_TABLE_NAME).set({ ...omit(this.properties, ['id', 'created']) }).where`id = ${this._invite.id}`;
    }
}