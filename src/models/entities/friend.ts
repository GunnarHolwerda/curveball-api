import { User, IUserResponse } from './user';
import { Database } from '../database';
import { FriendFactory } from '../factories/friend-factory';
import { UserFactory } from '../factories/user-factory';
import { omit } from '../../util/omit';

export interface IFriend {
    id: string;
    deleted: boolean;
    created: Date;
    account_user_id: string;
    friend_user_id: string;
}

export interface IFriendResponse {
    id: string;
    created: Date;
    friend: IUserResponse;
}

export const FRIEND_TABLE_NAME = 'friends';

export class Friend {
    public properties: IFriend;

    constructor(private _friend: IFriend) {
        this.properties = { ...this._friend };
    }

    public static async create(inviter: User, invitee: User): Promise<Friend> {
        const sq = Database.instance.sq;
        await sq.from(FRIEND_TABLE_NAME).insert({
            account_user_id: inviter.properties.user_id,
            friend_user_id: invitee.properties.user_id,
        });
        return (await FriendFactory.load(inviter.properties.user_id, invitee.properties.user_id))!;
    }

    public get user(): Promise<User> {
        return (async () => {
            return (await UserFactory.load(this.properties.friend_user_id))!;
        })();
    }

    public async toResponseObject(): Promise<IFriendResponse> {
        return {
            id: this.properties.id,
            created: this.properties.created,
            friend: (await this.user).toResponseObject()
        };
    }

    public async delete(): Promise<void> {
        this.properties.deleted = true;
        await this.save();
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(FRIEND_TABLE_NAME).set({ ...omit(this.properties, ['id']) }).where`id = ${this._friend.id}`;
    }
}