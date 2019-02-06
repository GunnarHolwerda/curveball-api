import { User, IUser, USER_TABLE_NAME } from '../entities/user';
import { Database } from '../database';
import { PhoneVerifier } from '../phone-verifier';
import { Row } from 'sqorn-pg/types/methods';

export class UserFactory {
    public static async load(userId: string): Promise<User | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(USER_TABLE_NAME).where`user_id = ${userId}`;
        if (result.length === 0) {
            return null;
        }
        return new User(result[0] as IUser);
    }

    public static async batchLoad(userIds: Array<string>): Promise<Array<User>> {
        if (userIds.length === 0) {
            return [];
        }
        const sq = Database.instance.sq;
        const userIdToIndexMap: { [userId: string]: number } = userIds.reduce((carry, id, index) => {
            carry[id] = index;
            return carry;
        }, {});
        const result = await sq.from(USER_TABLE_NAME).where(sq.raw(`user_id IN (${userIds.map(i => `'${i}'`).join(',')})`));
        if (result.length === 0) {
            return [];
        }
        const reorderdUsers: Array<Row> = [];
        result.forEach((user) => {
            reorderdUsers[userIdToIndexMap[user.user_id]] = user;
        });
        return reorderdUsers.map(r => new User(r as IUser));
    }

    public static async loadByUsername(username: string): Promise<User | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(USER_TABLE_NAME).where`username = ${username}`;
        if (result.length === 0) {
            return null;
        }
        return new User(result[0] as IUser);
    }

    public static async loadByPhone(phone: string): Promise<User | null> {
        const formattedPhoneNumber = PhoneVerifier.getValidPhoneNumber(phone);
        if (formattedPhoneNumber === null) {
            throw new Error('Invalid phone number');
        }
        const sq = Database.instance.sq;
        const result = await sq.from(USER_TABLE_NAME).where`phone = ${formattedPhoneNumber}`;
        if (result.length === 0) {
            return null;
        }
        return new User(result[0] as IUser);
    }
}