import { CurveballNotFound } from '../curveball-error';
import { User, IUser, USER_TABLE_NAME } from '../user';
import { Database } from '../database';

export class UserFactory {
    public static async load(userId: string): Promise<User> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${USER_TABLE_NAME}
                                        WHERE user_id = $1;
                                    `, [userId]);
        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return new User(result.rows[0] as IUser);
    }

    public static async batchLoad(userIds: Array<string>): Promise<Array<User>> {
        if (userIds.length === 0) {
            return [];
        }
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${USER_TABLE_NAME}
                                        WHERE user_id IN $1;
                                    `, userIds);
        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return result.rows.map(r => new User(r as IUser));
    }

    public static async loadByUsername(username: string): Promise<User> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${USER_TABLE_NAME}
                                        WHERE username = $1;
                                    `, [username]);
        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return new User(result.rows[0] as IUser);
    }

    public static async loadByPhone(phone: string): Promise<User> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${USER_TABLE_NAME}
                                        WHERE phone = $1;
                                    `, [phone]);
        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return new User(result.rows[0] as IUser);
    }
}