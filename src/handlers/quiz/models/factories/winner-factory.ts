import { Winner, WINNER_TABLE_NAME } from '../winner';
import { Database } from '../database';

export class WinnerFactory {
    public static async loadAllForUser(userId: string): Promise<Array<Winner>> {
        const result = await Database.instance.client.query(`
            SELECT * FROM ${WINNER_TABLE_NAME} WHERE user_id = $1;
        `, [userId]);

        return result.rows.map(r => new Winner(r));
    }
}